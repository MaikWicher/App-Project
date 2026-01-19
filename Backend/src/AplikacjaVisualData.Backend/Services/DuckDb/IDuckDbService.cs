using AplikacjaVisualData.Backend.Api.Queries;

namespace AplikacjaVisualData.Backend.Services.DuckDb;

public interface IDuckDbService
{
    Task ImportCsvAsync(string filePath, string tableName, CancellationToken ct);
    Task ImportParquetAsync(string filePath, string tableName, CancellationToken ct);
    Task ImportJsonAsync(string filePath, string tableName, CancellationToken ct);
    Task ImportExcelAsync(string filePath, string tableName, CancellationToken ct);
    Task ExecuteSqlAsync(string sql, CancellationToken ct);

    Task<IReadOnlyList<string>> ListTablesAsync(CancellationToken ct);
    Task<TableResultDto> GetTableDataAsync(string tableName, int limit, int offset, CancellationToken ct);
    Task DropTableAsync(string tableName, CancellationToken ct);
}
