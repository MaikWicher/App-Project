using System;
using System.Collections.Generic;
using System.Linq;

namespace AplikacjaVisualData.Backend.Services.Logging;

public sealed record LogItem(DateTimeOffset TsUtc, string Level, string Message);

public interface ILogStore
{
    void Add(LogItem item);
    IReadOnlyList<LogItem> Tail(int limit);
}

public sealed class InMemoryLogStore : ILogStore
{
    private readonly LinkedList<LogItem> _items = new();
    private readonly object _lock = new();
    private const int Max = 2000;

    public void Add(LogItem item)
    {
        lock (_lock)
        {
            _items.AddFirst(item);
            while (_items.Count > Max) _items.RemoveLast();
        }
    }

    public IReadOnlyList<LogItem> Tail(int limit)
    {
        lock (_lock)
            return _items.Take(Math.Clamp(limit, 1, Max)).ToList();
    }
}
