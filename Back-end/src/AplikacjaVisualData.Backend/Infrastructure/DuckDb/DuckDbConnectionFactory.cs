using System.Data.Common;
using DuckDB.NET.Data;
using Microsoft.Extensions.Options;

namespace AplikacjaVisualData.Backend.Infrastructure.DuckDb;

public sealed class DuckDbConnectionFactory : IDuckDbConnectionFactory
{
    private readonly DuckDbOptions _options;

    public DuckDbConnectionFactory(IOptions<DuckDbOptions> options)
    {
        _options = options.Value;
    }

    public DbConnection CreateConnection()
    {
        // DuckDB.NET.Data używa składni "DataSource=..." (w praktyce działa też "Data Source").
        var connectionString = $"DataSource={_options.DatabasePath}";
        return new DuckDBConnection(connectionString);
    }
}
