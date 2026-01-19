using AplikacjaVisualData.Backend.Common.Contracts;
using AplikacjaVisualData.Backend.Services.DuckDb;
using Microsoft.AspNetCore.Routing;
using AplikacjaVisualData.Backend.Api.Queries;

namespace AplikacjaVisualData.Backend.Api.Data;

public static class DataEndpoints
{
    public static IEndpointRouteBuilder MapDataEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/data/tables", ListTables)
            .WithName("ListTables")
            .WithTags("Data");

        app.MapGet("/api/data/table/{tableName}", GetTable)
            .WithName("GetTable")
            .WithTags("Data");

        // alias bez /api
        app.MapGet("/data/tables", ListTables)
            .WithName("ListTablesAlias")
            .WithTags("Data");

        app.MapGet("/data/table/{tableName}", GetTable)
            .WithName("GetTableAlias")
            .WithTags("Data");

        return app;
    }

    private static async Task<IResult> ListTables(IDuckDbService duck, CancellationToken ct)
    {
        var tables = await duck.ListTablesAsync(ct);
        return Results.Ok(ApiEnvelope<IReadOnlyList<string>>.Success(tables));
    }

    private static async Task<IResult> GetTable(
        string tableName,
        int? limit,
        int? offset,
        IDuckDbService duck,
        CancellationToken ct)
    {
        var data = await duck.GetTableDataAsync(
            tableName,
            limit ?? 200,
            offset ?? 0,
            ct);

        return Results.Ok(ApiEnvelope<TableResultDto>.Success(data));
    }
}
