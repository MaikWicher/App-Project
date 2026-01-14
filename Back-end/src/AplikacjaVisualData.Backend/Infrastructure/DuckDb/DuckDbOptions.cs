namespace AplikacjaVisualData.Backend.Infrastructure.DuckDb;

public sealed class DuckDbOptions
{
    public const string SectionName = "DuckDb";
    public string DatabasePath { get; init; } = "./data/dev.duckdb";
}
