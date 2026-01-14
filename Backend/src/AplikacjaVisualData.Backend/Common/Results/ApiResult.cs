namespace AplikacjaVisualData.Backend.Common.Results;

public sealed record ApiResult(bool Ok, ApiError? Error = null)
{
    public static ApiResult Success() => new(true, null);
    public static ApiResult Fail(ApiError error) => new(false, error);
}
