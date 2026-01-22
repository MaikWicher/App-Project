using AplikacjaVisualData.Backend.Api.Jobs;
using AplikacjaVisualData.Backend.Api.Data;
using AplikacjaVisualData.Backend.Api.Import;
// using AplikacjaVisualData.Backend.Api.Logs;
using AplikacjaVisualData.Backend.Api.Queries;
using AplikacjaVisualData.Backend.Api.System;
using AplikacjaVisualData.Backend.Infrastructure.DuckDb;
using AplikacjaVisualData.Backend.Services.DuckDb;
using AplikacjaVisualData.Backend.Services.History;
using AplikacjaVisualData.Backend.Services.Jobs;
using AplikacjaVisualData.Backend.Services.Logging;
using Microsoft.AspNetCore.Http.Json;

var builder = WebApplication.CreateBuilder(args);

// Increase Kestrel upload limit (e.g. 500MB)
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 524_288_000;
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
            else
            {
                // W wersji desktopowej (Electron) również pozwalamy na wszystko,
                // bo frontend wczytywany jest z plików (file://) lub lokalnego serwera.
                // Bezpieczeństwo zapewnia fakt, że backend słucha tylko na localhost.
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
        });
});



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
builder.Services.AddSingleton<IDuckDbService, DuckDbService>();

// Contract v0: magazyny (in-memory) + joby + logi
builder.Services.AddSingleton<IQueryHistoryStore, InMemoryQueryHistoryStore>();
builder.Services.AddSingleton<ILogStore, InMemoryLogStore>();
builder.Services.AddSingleton<IJobManager, JobManager>();
builder.Services.AddHostedService(sp => (JobManager)sp.GetRequiredService<IJobManager>());
builder.Services.AddSingleton<ILoggerProvider, LogStoreLoggerProvider>();
builder.Services.AddAntiforgery();

var app = builder.Build();


app.UseCors("AllowFrontend");
app.UseAntiforgery();

app.MapSystemEndpoints();
app.MapQueryEndpoints();
app.MapImportEndpoints();
app.MapDataEndpoints();
// app.MapLogsEndpoints();
app.MapJobsEndpoints();

app.Run();
