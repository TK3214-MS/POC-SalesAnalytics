using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Azure.Identity;
using FunctionsApp.Data;
using FunctionsApp.Data.Mock;
using FunctionsApp.AI;
using FunctionsApp.AI.Mock;

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

        // デモモードの判定
        var isDemoMode = context.Configuration["DEMO_MODE"]?.ToLower() == "true";
        
        if (isDemoMode)
        {
            Console.WriteLine("🎭 DEMO MODE: Using mock services (no Azure connection required)");
            
            // モックリポジトリ
            services.AddSingleton<ICosmosRepository, MockCosmosRepository>();
            services.AddSingleton<ISearchRepository, MockSearchRepository>();
            services.AddSingleton<IBlobRepository, MockBlobRepository>();
            services.AddSingleton<ISharePointRepository, MockSharePointRepository>();

            // モック AI クライアント
            services.AddSingleton<ISpeechClient, MockSpeechClient>();
            services.AddSingleton<ILanguageClient, MockLanguageClient>();
            services.AddSingleton<IOpenAIClient, MockOpenAIClient>();
        }
        else
        {
            Console.WriteLine("☁️  PRODUCTION MODE: Using Azure services");
            
            // Azure リポジトリ
            services.AddSingleton<ICosmosRepository, CosmosRepository>();
            services.AddSingleton<ISearchRepository, SearchRepository>();
            services.AddSingleton<IBlobRepository, BlobRepository>();
            services.AddSingleton<ISharePointRepository, SharePointRepository>();

            // Azure AI クライアント
            services.AddSingleton<ISpeechClient, SpeechClient>();
            services.AddSingleton<ILanguageClient, LanguageClient>();
            services.AddSingleton<IOpenAIClient, OpenAIClient>();
        }
    })
    .Build();

host.Run();
