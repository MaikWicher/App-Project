namespace AplikacjaVisualData.Backend.Common.Results;

public sealed record ApiError(string Code, string Message, object? Details = null);
