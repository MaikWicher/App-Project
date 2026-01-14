using Microsoft.Extensions.Logging;

namespace AplikacjaVisualData.Backend.Services.Logging;

/// <summary>
/// Prosty provider loggera zapisujący logi do pamięci (pod /logs/tail).
/// </summary>
public sealed class LogStoreLoggerProvider(ILogStore store) : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName) => new LogStoreLogger(store, categoryName);
    public void Dispose() { }

    private sealed class LogStoreLogger(ILogStore store, string category) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;
        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var msg = formatter(state, exception);
            if (exception is not null)
                msg += $" | {exception.GetType().Name}: {exception.Message}";

            store.Add(new LogItem(DateTimeOffset.UtcNow, logLevel.ToString(), $"[{category}] {msg}"));
        }

        private sealed class NullScope : IDisposable
        {
            public static readonly NullScope Instance = new();
            public void Dispose() { }
        }
    }
}
