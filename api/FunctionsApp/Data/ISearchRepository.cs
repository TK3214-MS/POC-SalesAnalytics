namespace FunctionsApp.Data;

public interface ISearchRepository
{
    Task IndexSessionAsync(Shared.Session session);
}
