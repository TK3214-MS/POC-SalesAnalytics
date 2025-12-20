# 環境変数設定ガイド

## フロントエンド (`frontend/.env.local`)

```bash
# Next.js Public Variables (クライアントサイドで参照可能)
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api

# Server-side Only
AZURE_AD_CLIENT_ID=<your-azure-ad-client-id>
AZURE_AD_TENANT_ID=<your-azure-ad-tenant-id>
AZURE_AD_CLIENT_SECRET=<your-azure-ad-client-secret>
```

### 説明
- `NEXT_PUBLIC_API_BASE_URL`：バックエンド Azure Functions のベース URL
- `AZURE_AD_CLIENT_ID`：Azure AD B2C / Entra ID のクライアントID（認証用）
- `AZURE_AD_TENANT_ID`：テナントID
- `AZURE_AD_CLIENT_SECRET`：クライアントシークレット（サーバーサイドのみ）

## バックエンド (`api/FunctionsApp/local.settings.json`)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    
    "CosmosDbConnectionString": "AccountEndpoint=https://<your-cosmos>.documents.azure.com:443/;AccountKey=<key>",
    "CosmosDbDatabaseName": "SalesAnalytics",
    "CosmosDbSessionsContainerName": "sessions",
    "CosmosDbAuditContainerName": "label_audit",
    
    "BlobStorageConnectionString": "DefaultEndpointsProtocol=https;AccountName=<account>;AccountKey=<key>;EndpointSuffix=core.windows.net",
    "BlobContainerName": "audio-uploads",
    
    "SpeechServiceEndpoint": "https://<region>.api.cognitive.microsoft.com/",
    "SpeechServiceKey": "<speech-key>",
    
    "LanguageServiceEndpoint": "https://<region>.api.cognitive.microsoft.com/",
    "LanguageServiceKey": "<language-key>",
    
    "OpenAIEndpoint": "https://<your-openai>.openai.azure.com/",
    "OpenAIKey": "<openai-key>",
    "OpenAIDeploymentName": "gpt-4o",
    
    "SearchServiceEndpoint": "https://<your-search>.search.windows.net",
    "SearchServiceKey": "<search-admin-key>",
    "SearchIndexName": "sessions-index",
    
    "KeyVaultUri": "https://<your-keyvault>.vault.azure.net/"
  }
}
```

### 説明
- `AzureWebJobsStorage`：Functions のストレージ（ローカル開発時は Azurite 使用可）
- `FUNCTIONS_WORKER_RUNTIME`：.NET Isolated を使用
- **Cosmos DB**：接続文字列、データベース名、コンテナ名
- **Blob Storage**：音声ファイル一時保存用
- **Speech Service**：文字起こし + 話者分離
- **Language Service**：PII検出、感情分析
- **OpenAI**：GPT-4o で要約
- **AI Search**：ベクトル検索用
- **Key Vault**：本番環境では Managed Identity で Secrets 取得

## 本番環境（Azure）

### Managed Identity 使用
本番環境では、Functions App の Managed Identity を有効化し、以下のように Key Vault から Secrets を取得：

```csharp
// Program.cs
var keyVaultUri = Environment.GetEnvironmentVariable("KeyVaultUri");
if (!string.IsNullOrEmpty(keyVaultUri))
{
    config.AddAzureKeyVault(
        new Uri(keyVaultUri),
        new DefaultAzureCredential()
    );
}
```

**注意**: Azure Functions Worker SDK 1.18.1 を使用する場合、`Azure.Extensions.AspNetCore.Configuration.Secrets` v1.3.2 パッケージが必要です。

### Key Vault Secrets 名
- `CosmosDbConnectionString`
- `BlobStorageConnectionString`
- `SpeechServiceKey`
- `LanguageServiceKey`
- `OpenAIKey`
- `SearchServiceKey`

### RBAC 設定
Functions App の Managed Identity に以下のロールを付与：
- **Cosmos DB**：Cosmos DB Built-in Data Contributor
- **Blob Storage**：Storage Blob Data Contributor
- **Key Vault**：Key Vault Secrets User
- **AI Search**：Search Index Data Contributor

## 環境別パラメータ

### 開発環境（`infra/params.dev.json`）
```json
{
  "environment": "dev",
  "location": "japaneast",
  "skuTier": "Basic"
}
```

### 本番環境（`infra/params.prod.json`）
```json
{
  "environment": "prod",
  "location": "japaneast",
  "skuTier": "Standard",
  "enableMultiRegion": true
}
```

## トラブルシューティング

### 必要な NuGet パッケージ

プロジェクトで使用している主要な NuGet パッケージ：

```xml
<!-- Azure Functions Core -->
<PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.24.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.18.1" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http" Version="3.2.0" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.DurableTask" Version="1.1.5" />
<PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Timer" Version="4.3.1" />

<!-- Azure Services -->
<PackageReference Include="Azure.Identity" Version="1.14.2" />
<PackageReference Include="Azure.Security.KeyVault.Secrets" Version="4.8.0" />
<PackageReference Include="Azure.Storage.Blobs" Version="12.23.0" />
<PackageReference Include="Microsoft.Azure.Cosmos" Version="3.45.0" />
<PackageReference Include="Azure.Search.Documents" Version="11.7.0" />
<PackageReference Include="Azure.AI.OpenAI" Version="2.1.0" />
<PackageReference Include="Azure.AI.TextAnalytics" Version="5.3.0" />

<!-- Configuration & Extensions -->
<PackageReference Include="Microsoft.Extensions.Configuration.UserSecrets" Version="8.0.1" />
<PackageReference Include="Azure.Extensions.AspNetCore.Configuration.Secrets" Version="1.3.2" />
<PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.1" />
<PackageReference Include="Microsoft.ApplicationInsights.WorkerService" Version="2.22.0" />

<!-- Validation -->
<PackageReference Include="FluentValidation" Version="11.11.0" />
```

パッケージのインストール：
```bash
cd api/FunctionsApp
dotnet restore
```

### Azurite（ローカル開発）
Windows の場合、Azurite を別途起動：
```bash
npm install -g azurite
azurite --silent --location c:\azurite --debug c:\azurite\debug.log
```

### Cosmos DB Emulator
ローカル開発時は Cosmos DB Emulator を使用可能：
```bash
# 接続文字列
AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
```

### Functions のログ確認
```bash
cd api/FunctionsApp
func start --verbose
```

Application Insights のログは Azure Portal で確認。

### Windows ARM64 環境での問題

Windows ARM64 環境で `func start` を実行すると、以下のエラーが表示される場合があります：

```
Could not load file or assembly 'Microsoft.Azure.Functions.Platform.Metrics.LinuxConsumption'
```

**対処法**：

1. **VS Code タスクから実行**（推奨）
   - `Ctrl+Shift+P` → `Tasks: Run Task` → `build (functions)` を実行
   - Functions が自動的に起動します

2. **ビルド出力ディレクトリから実行**
   ```bash
   cd api/FunctionsApp
   dotnet build
   cd bin/Debug/net8.0
   func host start
   ```

3. **エラーメッセージを無視**
   - エラーメッセージは表示されますが、Functions は正常に動作します
   - `http://localhost:7071` でエンドポイントが起動していることを確認

これは Azure Functions Core Tools 4.6.0 の Windows ARM64 環境における既知の制限です。
