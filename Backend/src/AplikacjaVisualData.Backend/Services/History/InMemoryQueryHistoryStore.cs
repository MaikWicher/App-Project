using System;
using System.Collections.Generic;
using System.Linq;

namespace AplikacjaVisualData.Backend.Services.History;

public sealed record QueryHistoryItem(
    string Id,
    DateTimeOffset TsUtc,
    string Sql,
    long ElapsedMs,
    string Status,
    string? ErrorCode = null
);

public interface IQueryHistoryStore
{
    void Add(QueryHistoryItem item);
    IReadOnlyList<QueryHistoryItem> Tail(int limit);
}

public sealed class InMemoryQueryHistoryStore : IQueryHistoryStore
{
    private readonly LinkedList<QueryHistoryItem> _items = new();
    private readonly object _lock = new();
    private const int Max = 1000;

    public void Add(QueryHistoryItem item)
    {
        lock (_lock)
        {
            _items.AddFirst(item);
            while (_items.Count > Max) _items.RemoveLast();
        }
    }

    public IReadOnlyList<QueryHistoryItem> Tail(int limit)
    {
        lock (_lock)
            return _items.Take(Math.Clamp(limit, 1, Max)).ToList();
    }
}
