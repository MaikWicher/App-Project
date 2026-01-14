using AplikacjaVisualData.Backend.Common.Contracts;
using AplikacjaVisualData.Backend.Services.Jobs;
using System.Threading.Tasks;

namespace AplikacjaVisualData.Backend.Api.Jobs;

public static class JobsEndpoints
{
    public static IEndpointRouteBuilder MapJobsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/jobs", (CreateJobRequest req, IJobManager jobs) =>
        {
            if (string.IsNullOrWhiteSpace(req.Type))
                return Results.Json(ApiEnvelope<object>.Fail("job.invalid", "Pole 'type' jest puste."), statusCode: 400);

            // v0: w tym patchu tworzymy joba i zwracamy jobId.
            // Pod konkretne typy (np. query.execute) podepniemy realną pracę w kolejnym kroku.
            var jobId = jobs.Enqueue(req.Type, _ => Task.FromResult<object?>(new { note = "v0 stub" }));
            return Results.Json(ApiEnvelope<object>.Success(new { jobId }), statusCode: 202);
        });

        app.MapGet("/jobs/{jobId}", (string jobId, IJobManager jobs) =>
        {
            var info = jobs.Get(jobId);
            return info is null
                ? Results.Json(ApiEnvelope<object>.Fail("job.notFound", "Nie znaleziono joba."), statusCode: 404)
                : Results.Json(ApiEnvelope<JobInfo>.Success(info));
        });

        app.MapDelete("/jobs/{jobId}", (string jobId, IJobManager jobs) =>
        {
            var ok = jobs.Cancel(jobId);
            return ok
                ? Results.Json(ApiEnvelope<object>.Success(new { canceled = true }))
                : Results.Json(ApiEnvelope<object>.Fail("job.notFound", "Nie znaleziono joba."), statusCode: 404);
        });

        return app;
    }
}

public sealed record CreateJobRequest(string Type, object? Payload);
