# Development Environment – AplikacjaVisualData.Backend

## 1. System operacyjny

- Windows 10 (64-bit) lub Windows 11 (64-bit)
- **Microsoft Visual C++ Redistributable (2015-2022)**
  - Wymagane przez bibliotekę DuckDB.
  - [Pobierz tutaj (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe)

---

## 2. Wymagane narzędzia

### 2.1 .NET SDK

Wymagana wersja:
- **.NET SDK 8.0.x**
- Sprawdzona i używana w projekcie:
  - `8.0.416`

Sprawdzenie:
```bash
dotnet --list-sdks
