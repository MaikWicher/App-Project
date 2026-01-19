using DuckDB.NET.Data;
using System;

var dbFile = "test.db";
using (var conn = new DuckDBConnection($"Data Source={dbFile}"))
{
    conn.Open();
    var cmd = conn.CreateCommand();

    void TestPath(string label, string path) {
        try {
            Console.WriteLine($"Testing {label}: {path}");
            // Simulate the original bug: simple quote replacement, NO backslash replacement
            var badHelper = path.Replace("'", "''"); 
            cmd.CommandText = $"SELECT '{badHelper}'";
            cmd.ExecuteScalar();
            Console.WriteLine("✅ WORKS");
        } catch (Exception ex) {
            Console.WriteLine($"❌ FAILED: {ex.Message}");
        }
    }

    // 1. Relative Path (Common)
    // .\data\uploads
    // \d -> ?
    // \u -> imports?
    TestPath("Relative Path", ".\\data\\uploads\\file.csv");

    // 2. The 'Backend' folder (Backspace?)
    TestPath("Backend Folder", "C:\\Projekt\\Backend\\file.csv");

    // 3. User's specific path
    TestPath("User Path", "c:\\Projekt\\App-Project\\Backend\\file.csv");

    // 4. Other Dev's specific path
    // C:\Users\PC\OneDrive\Pulpit\Projekt.Wdrozeniowy\Backend
    // \Users -> \U ?
    // \OneDrive -> \O ?
    TestPath("Other Dev Path", "C:\\Users\\PC\\OneDrive\\Pulpit\\Projekt.Wdrozeniowy\\Backend\\file.csv");
}
