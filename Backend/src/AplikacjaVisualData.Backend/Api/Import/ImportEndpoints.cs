using AplikacjaVisualData.Backend.Common.Contracts;
using AplikacjaVisualData.Backend.Services.DuckDb;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AplikacjaVisualData.Backend.Api.Import;

public static class ImportEndpoints
{
    public static IEndpointRouteBuilder MapImportEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/import/file", ImportFile)
            .WithName("ImportFile")
            .WithTags("Import");

        // alias bez /api
        app.MapPost("/import/file", ImportFile)
            .WithName("ImportFileAlias")
            .WithTags("Import");

        return app;
    }

    private static async Task<IResult> ImportFile(
        IFormFile file,
        string? tableName,
        IDuckDbService duck,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return Results.BadRequest(ApiEnvelope<object?>.Fail("import.noFile", "Brak pliku do importu."));

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var name = string.IsNullOrWhiteSpace(tableName)
            ? MakeTableName(Path.GetFileNameWithoutExtension(file.FileName))
            : MakeTableName(tableName);

        Directory.CreateDirectory("./data/uploads");
        var tmpPath = Path.Combine("./data/uploads", $"{Guid.NewGuid():N}{ext}");

        try
        {
            await using (var fs = File.Open(tmpPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(fs, ct);
            }

            switch (ext)
            {
                case ".csv":
                    await duck.ImportCsvAsync(tmpPath, name, ct);
                    break;
                case ".parquet":
                    await duck.ImportParquetAsync(tmpPath, name, ct);
                    break;
                case ".json":
                    await duck.ImportJsonAsync(tmpPath, name, ct);
                    break;
                case ".xlsx":
                case ".xls":
                    await duck.ImportExcelAsync(tmpPath, name, ct);
                    break;
                case ".sql":
                    var sql = await File.ReadAllTextAsync(tmpPath, ct);
                    await duck.ExecuteSqlAsync(sql, ct);
                    break;
                default:
                    return Results.BadRequest(ApiEnvelope<object?>.Fail(
                        "import.unsupported",
                        $"Nieobsługiwany format: {ext}."));
            }

            return Results.Ok(ApiEnvelope<ImportResult>.Success(new ImportResult(name, ext)));
        }
        finally
        {
            try { if (File.Exists(tmpPath)) File.Delete(tmpPath); } catch { /* ignoruj */ }
        }
    }

    private static string MakeTableName(string raw)
    {
        raw = (raw ?? "tabela").Trim();
        if (raw.Length == 0) raw = "tabela";

        var sb = new global::System.Text.StringBuilder(raw.Length);
        foreach (var ch in raw)
        {
            if (char.IsLetterOrDigit(ch) || ch == '_') sb.Append(ch);
            else sb.Append('_');
        }

        var name = sb.ToString();
        if (char.IsDigit(name[0])) name = "t_" + name;
        return name;
    }
}

public sealed record ImportResult(string TableName, string Source);
