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
var credential = new DefaultAzureCredential();
var client = new SecretClient(new Uri(keyVaultUri), credential);

var cosmosSecret = await client.GetSecretAsync("CosmosDbConnectionString");
var cosmosConnectionString = cosmosSecret.Value.Value;
```

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
