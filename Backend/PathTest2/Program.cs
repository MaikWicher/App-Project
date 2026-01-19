using DuckDB.NET.Data;
using System;

var dbFile = "test.db";
using (var conn = new DuckDBConnection($"Data Source={dbFile}"))
{
    conn.Open();
    var cmd = conn.CreateCommand();
    try {
        cmd.CommandText = "SELECT * FROM read_csv_auto('missing_file_xyz.csv')";
        cmd.ExecuteScalar();
    } catch (Exception ex) {
        Console.WriteLine($"Error for missing file: {ex.Message}");
    }
}
