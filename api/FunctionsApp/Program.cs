using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Azure.Identity;
using FunctionsApp.Data;
using FunctionsApp.AI;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureAppConfiguration((context, config) =>
    {
        // Key Vault 統合（本番環境）
        var keyVaultUri = Environment.GetEnvironmentVariable("KeyVaultUri");
        if (!string.IsNullOrEmpty(keyVaultUri))
        {
            config.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential()
            );
        }
    })
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();

        // Repositories
        services.AddSingleton<CosmosRepository>();
        services.AddSingleton<SearchRepository>();
        services.AddSingleton<BlobRepository>();
        services.AddSingleton<SharePointRepository>();

        // AI Clients
        services.AddSingleton<SpeechClient>();
        services.AddSingleton<LanguageClient>();
        services.AddSingleton<OpenAIClient>();
    })
    .Build();

host.Run();
