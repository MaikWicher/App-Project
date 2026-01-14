using AplikacjaVisualData.Backend.Api.Jobs;
using AplikacjaVisualData.Backend.Api.Logs;
using AplikacjaVisualData.Backend.Api.Queries;
using AplikacjaVisualData.Backend.Api.System;
using AplikacjaVisualData.Backend.Infrastructure.DuckDb;
using AplikacjaVisualData.Backend.Services.History;
using AplikacjaVisualData.Backend.Services.Jobs;
using AplikacjaVisualData.Backend.Services.Logging;
using Microsoft.AspNetCore.Http.Json;

var builder = WebApplication.CreateBuilder(args);

// Konfiguracja backendu
builder.Services.Configure<DuckDbOptions>(
    builder.Configuration.GetSection(DuckDbOptions.SectionName));

// Ustawienia JSON
builder.Services.Configure<JsonOptions>(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.SerializerOptions.WriteIndented = false;
});

// Konfiguracja DuckDB
builder.Services.AddSingleton<IDuckDbConnectionFactory, DuckDbConnectionFactory>();

// Contract v0: magazyny (in-memory) + joby + logi
builder.Services.AddSingleton<IQueryHistoryStore, InMemoryQueryHistoryStore>();
builder.Services.AddSingleton<ILogStore, InMemoryLogStore>();
builder.Services.AddSingleton<IJobManager, JobManager>();
builder.Services.AddHostedService(sp => (JobManager)sp.GetRequiredService<IJobManager>());
builder.Services.AddSingleton<ILoggerProvider, LogStoreLoggerProvider>();

var app = builder.Build();

app.MapSystemEndpoints();
app.MapQueryEndpoints();
app.MapLogsEndpoints();
app.MapJobsEndpoints();

app.Run();
