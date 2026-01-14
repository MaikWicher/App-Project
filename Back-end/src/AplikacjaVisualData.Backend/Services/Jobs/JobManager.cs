using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;

namespace AplikacjaVisualData.Backend.Services.Jobs;

public enum JobStatus { Queued, Running, Success, Failed, Canceled }

public sealed record JobInfo(
    string JobId,
    string Type,
    JobStatus Status,
    string? Message,
    int? Progress,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    object? ResultRef = null,
    JobError? Error = null
);

public sealed record JobError(string Code, string Message, object? Details = null);

public interface IJobManager
{
    string Enqueue(string type, Func<CancellationToken, Task<object?>> work);
    JobInfo? Get(string jobId);
    bool Cancel(string jobId);
    (int queued, int running, int completed, int failed) Stats();
}

/// <summary>
/// Minimalny system "jobów" (Contract v0):
/// - kolejka w pamięci
/// - status + cancel
/// - limit równoległości
/// Docelowo można dodać trwałość (DuckDB/plik) i postęp.
/// </summary>
public sealed class JobManager : BackgroundService, IJobManager
{
    private sealed record JobEntry(JobInfo Info, CancellationTokenSource Cts, Func<CancellationToken, Task<object?>> Work);

    private readonly ConcurrentDictionary<string, JobEntry> _jobs = new();
    private readonly ConcurrentQueue<string> _queue = new();
    private readonly SemaphoreSlim _signal = new(0);
    private readonly int _maxParallel;

    public JobManager(int maxParallel = 1) => _maxParallel = Math.Max(1, maxParallel);

    public string Enqueue(string type, Func<CancellationToken, Task<object?>> work)
    {
        var id = Guid.NewGuid().ToString("D");
        var now = DateTimeOffset.UtcNow;
        var cts = new CancellationTokenSource();
        var info = new JobInfo(id, type, JobStatus.Queued, "Queued", null, now, now);

        _jobs[id] = new JobEntry(info, cts, work);
        _queue.Enqueue(id);
        _signal.Release();
        return id;
    }

    public JobInfo? Get(string jobId) => _jobs.TryGetValue(jobId, out var e) ? e.Info : null;

    public bool Cancel(string jobId)
    {
        if (!_jobs.TryGetValue(jobId, out var e)) return false;
        e.Cts.Cancel();

        var now = DateTimeOffset.UtcNow;
        _jobs[jobId] = e with { Info = e.Info with { Status = JobStatus.Canceled, Message = "Canceled", UpdatedAtUtc = now } };
        return true;
    }

    public (int queued, int running, int completed, int failed) Stats()
    {
        var all = _jobs.Values.Select(x => x.Info).ToList();
        return (
            queued: all.Count(x => x.Status == JobStatus.Queued),
            running: all.Count(x => x.Status == JobStatus.Running),
            completed: all.Count(x => x.Status == JobStatus.Success),
            failed: all.Count(x => x.Status == JobStatus.Failed)
        );
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var workers = Enumerable.Range(0, _maxParallel).Select(_ => WorkerLoop(stoppingToken)).ToArray();
        return Task.WhenAll(workers);
    }

    private async Task WorkerLoop(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await _signal.WaitAsync(stoppingToken);

            if (!_queue.TryDequeue(out var jobId)) continue;
            if (!_jobs.TryGetValue(jobId, out var entry)) continue;
            if (entry.Cts.IsCancellationRequested) continue;

            var now = DateTimeOffset.UtcNow;
            _jobs[jobId] = entry with { Info = entry.Info with { Status = JobStatus.Running, Message = "Running", UpdatedAtUtc = now } };

            try
            {
                var resultRef = await entry.Work(entry.Cts.Token);

                now = DateTimeOffset.UtcNow;
                _jobs[jobId] = _jobs[jobId] with
                {
                    Info = _jobs[jobId].Info with { Status = JobStatus.Success, Message = "Success", UpdatedAtUtc = now, ResultRef = resultRef }
                };
            }
            catch (OperationCanceledException)
            {
                now = DateTimeOffset.UtcNow;
                _jobs[jobId] = _jobs[jobId] with
                {
                    Info = _jobs[jobId].Info with { Status = JobStatus.Canceled, Message = "Canceled", UpdatedAtUtc = now }
                };
            }
            catch (Exception ex)
            {
                now = DateTimeOffset.UtcNow;
                _jobs[jobId] = _jobs[jobId] with
                {
                    Info = _jobs[jobId].Info with
                    {
                        Status = JobStatus.Failed,
                        Message = "Failed",
                        UpdatedAtUtc = now,
                        Error = new JobError("job.failed", ex.Message, new { exception = ex.GetType().Name })
                    }
                };
            }
        }
    }
}
