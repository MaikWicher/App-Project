using System.Data.Common;

namespace AplikacjaVisualData.Backend.Infrastructure.DuckDb;

public interface IDuckDbConnectionFactory
{
    DbConnection CreateConnection();
}
