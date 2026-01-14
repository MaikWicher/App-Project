namespace AplikacjaVisualData.Backend.Common.Contracts;

/// <summary>
/// Wspólny "envelope" odpowiedzi API (Contract v0).
/// Frontend może opierać się na stałej strukturze: ok/data/error.
/// </summary>
public sealed record ApiEnvelope<T>(bool Ok, T? Data, ApiError? Error)
{
    public static ApiEnvelope<T> Success(T data) => new(true, data, null);

    public static ApiEnvelope<T> Fail(string code, string message, object? details = null)
        => new(false, default, new ApiError(code, message, details));
}

public sealed record ApiError(string Code, string Message, object? Details = null);
