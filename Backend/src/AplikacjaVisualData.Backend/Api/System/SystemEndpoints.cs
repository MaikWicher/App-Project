using AplikacjaVisualData.Backend.Common.Contracts;
using AplikacjaVisualData.Backend.Services.Jobs;

namespace AplikacjaVisualData.Backend.Api.System;

public static class SystemEndpoints
{
    public static IEndpointRouteBuilder MapSystemEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/system/status", (IConfiguration cfg) =>
        {
            var payload = new
            {
                nazwa = cfg["Backend:Name"] ?? "AplikacjaVisualData.Backend",
                wersja = cfg["Backend:Version"] ?? "0.0.0",
                czasUtc = DateTimeOffset.UtcNow
            };

            return Results.Json(ApiEnvelope<object>.Success(payload));
        });

        app.MapGet("/system/health", () =>
            Results.Json(ApiEnvelope<object>.Success(new { status = "ok" })));

        // Contract v0: proste metryki (bez Prometheusa) - przydatne dla UI.
        app.MapGet("/system/metrics", (IJobManager jobs) =>
        {
            var (queued, running, completed, failed) = jobs.Stats();
            var payload = new
            {
                jobs = new { queued, running, completed, failed },
                process = new
                {
                    workingSetBytes = Environment.WorkingSet,
                    gcTotalMemoryBytes = GC.GetTotalMemory(false)
                }
            };
            return Results.Json(ApiEnvelope<object>.Success(payload));
        });

        return app;
    }
}
