using AplikacjaVisualData.Backend.Common.Contracts;
using AplikacjaVisualData.Backend.Services.DuckDb;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using DuckDB.NET.Data;

namespace AplikacjaVisualData.Backend.Api.Import;

public static class ImportEndpoints
{
    public static IEndpointRouteBuilder MapImportEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/import/file", ImportFile)
            .WithName("ImportFile")
            .WithTags("Import")
            .DisableAntiforgery();

        // alias bez /api
        app.MapPost("/import/file", ImportFile)
            .WithName("ImportFileAlias")
            .WithTags("Import")
            .DisableAntiforgery();

        return app;
    }

    private static async Task<IResult> ImportFile(
        HttpContext context,
        string? tableName,
        IDuckDbService duck,
        CancellationToken ct)
    {
    {
        try 
        {
            if (!context.Request.HasFormContentType)
            {
                 return Results.BadRequest(ApiEnvelope<object?>.Fail("import.badRequest", "Wymagany Content-Type: multipart/form-data"));
            }

            var form = await context.Request.ReadFormAsync(ct);
            var file = form.Files.GetFile("file");
            
            if (file is null || file.Length == 0)
                return Results.BadRequest(ApiEnvelope<object?>.Fail("import.noFile", "Brak pliku do importu."));

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var name = string.IsNullOrWhiteSpace(tableName)
                ? MakeTableName(Path.GetFileNameWithoutExtension(file.FileName))
                : MakeTableName(tableName);

            Directory.CreateDirectory("./data/uploads");
            var tmpPath = Path.Combine("./data/uploads", $"{Guid.NewGuid():N}{ext}");
            var fullPath = Path.GetFullPath(tmpPath);

            try
            {
                await using (var fs = File.Open(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    await file.CopyToAsync(fs, ct);
                }

                try 
                {
                    switch (ext)
                    {
                        case ".csv":
                            await duck.ImportCsvAsync(fullPath, name, ct);
                            break;
                        case ".parquet":
                            await duck.ImportParquetAsync(fullPath, name, ct);
                            break;
                        case ".json":
                            await duck.ImportJsonAsync(fullPath, name, ct);
                            break;
                        case ".xlsx":
                        case ".xls":
                            await duck.ImportExcelAsync(fullPath, name, ct);
                            break;
                        case ".sql":
                            var sql = await File.ReadAllTextAsync(fullPath, ct);
                            await duck.ExecuteSqlAsync(sql, ct);
                            break;
                        default:
                            return Results.BadRequest(ApiEnvelope<object?>.Fail(
                                "import.unsupported",
                                $"Nieobsługiwany format: {ext}."));
                    }
                } 
                catch (DuckDBException ex)
                {
                     return Results.BadRequest(ApiEnvelope<object?>.Fail(
                        "import.duckdb_error",
                        $"Błąd bazy danych ({ex.Message}). Ścieżka: {fullPath}"));
                }
                catch (Exception ex)
                {
                     return Results.BadRequest(ApiEnvelope<object?>.Fail(
                        "import.error",
                        $"Błąd importu: {ex.Message}"));
                }

                return Results.Ok(ApiEnvelope<ImportResult>.Success(new ImportResult(name, ext)));
            }
            finally
            {
                try { if (File.Exists(tmpPath)) File.Delete(tmpPath); } catch { /* ignoruj */ }
            }
        }
        catch (Exception ex)
        {
             // Catch-all for Kestrel/Form/System errors
             return Results.Problem(
                detail: ex.Message,
                statusCode: 500,
                title: "Internal Server Error"
             );
        }
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
