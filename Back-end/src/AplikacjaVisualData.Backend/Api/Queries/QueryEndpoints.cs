using AplikacjaVisualData.Backend.Common.Contracts;
using AplikacjaVisualData.Backend.Common.Results;
using AplikacjaVisualData.Backend.Infrastructure.DuckDb;
using AplikacjaVisualData.Backend.Services.History;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Data.Common;
using System.Diagnostics;

namespace AplikacjaVisualData.Backend.Api.Queries;

public static class QueryEndpoints
{
    public static IEndpointRouteBuilder MapQueryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/queries/execute", Execute)
            .WithName("ExecuteQuery")
            .WithTags("Queries");

        return app;
    }

    private static async Task<IResult> Execute(
        ExecuteQueryRequest req,
        IDuckDbConnectionFactory dbFactory,
        IQueryHistoryStore history,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Sql))
        {
            return Results.BadRequest(
            ApiEnvelope<object?>.Fail("query.invalid", "Zapytanie SQL nie może być puste."));

        }

        var sw = Stopwatch.StartNew();

        await using DbConnection conn = dbFactory.CreateConnection();
        await conn.OpenAsync(ct);

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = req.Sql;

        await using var reader = await cmd.ExecuteReaderAsync(ct);

        var columns = new List<ColumnDto>();
        for (var i = 0; i < reader.FieldCount; i++)
        {
            columns.Add(new ColumnDto(
                reader.GetName(i),
                reader.GetDataTypeName(i)));
        }

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

        sw.Stop();

        var historyId = Guid.NewGuid().ToString("D");
        history.Add(new QueryHistoryItem(
            historyId,
            DateTimeOffset.UtcNow,
            req.Sql,
            sw.ElapsedMilliseconds,
            "ok"));

        var limit = req.Limit ?? 200;
        var offset = req.Offset ?? 0;
        var hasMore = rows.Count >= limit;

        var response = new ExecuteQueryResponse(
            new ExecutionDto(sw.ElapsedMilliseconds, rows.Count),
            new TableResultDto(
                columns,
                rows,
                hasMore,
                new PageDto(offset, limit, hasMore)
            ),
            historyId
        );

        return Results.Json(ApiEnvelope<ExecuteQueryResponse>.Success(response));
    }
}

#region DTOs (Contract v0)

public sealed record ExecuteQueryRequest(
    string Sql,
    int? Limit = null,
    int? Offset = null);

public sealed record ExecuteQueryResponse(
    ExecutionDto Execution,
    TableResultDto Result,
    string HistoryId);

public sealed record ExecutionDto(
    long DurationMs,
    int RowCount);

public sealed record TableResultDto(
    IReadOnlyList<ColumnDto> Columns,
    IReadOnlyList<object?[]> Rows,
    bool Truncated,
    PageDto Page);

public sealed record ColumnDto(
    string Name,
    string Type);

public sealed record PageDto(
    int Offset,
    int Limit,
    bool HasMore);

#endregion
