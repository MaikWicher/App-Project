using AplikacjaVisualData.Backend.Api.Queries;
using AplikacjaVisualData.Backend.Infrastructure.DuckDb;
using DuckDB.NET.Data;
using ExcelDataReader;
using Microsoft.Extensions.Options;
using System.Data;
using System.Data.Common;
using System.Globalization;
using System.Text;

namespace AplikacjaVisualData.Backend.Services.DuckDb;

public sealed class DuckDbService : IDuckDbService
{
    private readonly IDuckDbConnectionFactory _dbFactory;
    private readonly DuckDbOptions _options;

    public DuckDbService(
        IDuckDbConnectionFactory dbFactory,
        IOptions<DuckDbOptions> options)
    {
        _dbFactory = dbFactory;
        _options = options.Value;

        // ExcelDataReader: wsparcie dla ANSI/Windows-1250 itd.
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
    }

    public Task ImportCsvAsync(string filePath, string tableName, CancellationToken ct)
        => ImportFromFunctionAsync(tableName, $"read_csv_auto('{Escape(filePath)}')", ct);

    public Task ImportParquetAsync(string filePath, string tableName, CancellationToken ct)
        => ImportFromFunctionAsync(tableName, $"read_parquet('{Escape(filePath)}')", ct);

    public Task ImportJsonAsync(string filePath, string tableName, CancellationToken ct)
        => ImportFromFunctionAsync(tableName, $"read_json_auto('{Escape(filePath)}')", ct);

    public async Task ImportExcelAsync(string filePath, string tableName, CancellationToken ct)
    {
        var safeTable = QuoteIdent(tableName);

        using var stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        using var reader = ExcelReaderFactory.CreateReader(stream);
        var ds = reader.AsDataSet(new ExcelDataSetConfiguration
        {
            ConfigureDataTable = _ => new ExcelDataTableConfiguration
            {
                UseHeaderRow = true
            }
        });

        var dt = ds.Tables.Cast<DataTable>().FirstOrDefault();
        if (dt is null)
            throw new InvalidOperationException("Brak arkusza w pliku Excel.");

        var columns = dt.Columns.Cast<DataColumn>().ToList();
        if (columns.Count == 0)
            throw new InvalidOperationException("Brak kolumn w arkuszu Excel.");

        await using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync(ct);

        // Tworzymy tabelę: na start wszystko jako VARCHAR (bez zgadywania typów)
        await using (var cmd = conn.CreateCommand())
        {
            var colsSql = string.Join(", ", columns.Select(c => $"{QuoteIdent(NormalizeColumnName(c.ColumnName))} VARCHAR"));
            cmd.CommandText = $"CREATE OR REPLACE TABLE {safeTable} ({colsSql});";
            await cmd.ExecuteNonQueryAsync(ct);
        }

        // Używamy zwykłego inserta w pętli/transakcji, bo Appender API się zmieniło w nowszych wersjach
        await using var transaction = await conn.BeginTransactionAsync(ct);
        try
        {
            var insertSql = $"INSERT INTO {safeTable} VALUES ({string.Join(", ", Enumerable.Repeat("?", columns.Count))});";
            await using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = insertSql;
            insertCmd.Transaction = transaction;

            // Przygotowanie parametrów
            var dbParams = new DbParameter[columns.Count];
            for (int i = 0; i < columns.Count; i++)
            {
                var p = insertCmd.CreateParameter();
                insertCmd.Parameters.Add(p);
                dbParams[i] = p;
            }

            foreach (DataRow row in dt.Rows)
            {
                for (int i = 0; i < columns.Count; i++)
                {
                    var val = row[columns[i]];
                    if (val == DBNull.Value)
                    {
                        dbParams[i].Value = DBNull.Value;
                    }
                    else
                    {
                        dbParams[i].Value = Convert.ToString(val, CultureInfo.InvariantCulture);
                    }
                }
                await insertCmd.ExecuteNonQueryAsync(ct);
            }

            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task ExecuteSqlAsync(string sql, CancellationToken ct)
    {
        await using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync(ct);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<IReadOnlyList<string>> ListTablesAsync(CancellationToken ct)
    {
        var tables = new List<string>();

        await using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync(ct);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = "SHOW TABLES";

        await using var reader = await cmd.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct))
        {
            if (!reader.IsDBNull(0))
                tables.Add(reader.GetString(0));
        }

        return tables;
    }

    public async Task<TableResultDto> GetTableDataAsync(string tableName, int limit, int offset, CancellationToken ct)
    {
        limit = Math.Clamp(limit, 1, 10_000);
        offset = Math.Max(0, offset);

        await using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync(ct);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT * FROM {QuoteIdent(tableName)} LIMIT {limit} OFFSET {offset};";

        await using var reader = await cmd.ExecuteReaderAsync(ct);

        var columns = new List<ColumnDto>();
        for (var i = 0; i < reader.FieldCount; i++)
            columns.Add(new ColumnDto(reader.GetName(i), reader.GetDataTypeName(i)));

        var rows = new List<object?[]>();
        while (await reader.ReadAsync(ct))
        {
            var values = new object[reader.FieldCount];
            reader.GetValues(values);

            var arr = new object?[values.Length];
            for (var i = 0; i < values.Length; i++)
                arr[i] = values[i];

            rows.Add(arr);
        }

        // prosta heurystyka: jeśli zwróciliśmy limit wierszy, to "może być więcej"
        var hasMore = rows.Count >= limit;

        return new TableResultDto(
            columns,
            rows,
            hasMore,
            new PageDto(offset, limit, hasMore));
    }

    private async Task ImportFromFunctionAsync(string tableName, string functionSql, CancellationToken ct)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_options.DatabasePath) ?? "./data");

        await using var conn = _dbFactory.CreateConnection();
        await conn.OpenAsync(ct);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"CREATE OR REPLACE TABLE {QuoteIdent(tableName)} AS SELECT * FROM {functionSql};";
        await cmd.ExecuteNonQueryAsync(ct);
    }

    private static string Escape(string path) => path.Replace('\\', '/').Replace("'", "''");

    private static string NormalizeColumnName(string name)
    {
        name = string.IsNullOrWhiteSpace(name) ? "kolumna" : name.Trim();
        return name;
    }

    private static string QuoteIdent(string ident)
    {
        ident = string.IsNullOrWhiteSpace(ident) ? "tabela" : ident.Trim();
        return $"\"{ident.Replace("\"", "\"\"")}\"";
    }

    private static string UnquoteIdent(string ident)
        => ident.Trim().Trim('"');
}
