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

## Azure 上での操作手順

### 前提条件

以下のツールをインストール：
```bash
# Azure CLI
winget install -e --id Microsoft.AzureCLI

# Azure Developer CLI (azd)
winget install -e --id Microsoft.Azd

# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Azure にログイン：
```bash
az login
az account set --subscription "<your-subscription-id>"
```

### 1. Bicep を使用したリソースデプロイ

#### 開発環境のデプロイ
```bash
# リソースグループの作成
az group create --name rg-salesanalytics-dev --location japaneast

# Bicep テンプレートのデプロイ
az deployment sub create \
  --location japaneast \
  --template-file infra/main.bicep \
  --parameters infra/params.dev.json
```

#### 本番環境のデプロイ
```bash
az group create --name rg-salesanalytics-prod --location japaneast

az deployment sub create \
  --location japaneast \
  --template-file infra/main.bicep \
  --parameters infra/params.prod.json
```

### 2. Key Vault へのシークレット登録

```bash
# 変数設定
RESOURCE_GROUP="rg-salesanalytics-dev"
KEY_VAULT_NAME="kv-salesanalytics-dev"

# Cosmos DB 接続文字列
COSMOS_CONN=$(az cosmosdb keys list \
  --name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name CosmosDbConnectionString \
  --value "$COSMOS_CONN"

# Blob Storage 接続文字列
BLOB_CONN=$(az storage account show-connection-string \
  --name stgalesanalyticsdev \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name BlobStorageConnectionString \
  --value "$BLOB_CONN"

# Speech Service キー
SPEECH_KEY=$(az cognitiveservices account keys list \
  --name speech-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name SpeechServiceKey \
  --value "$SPEECH_KEY"

# Language Service キー
LANGUAGE_KEY=$(az cognitiveservices account keys list \
  --name language-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name LanguageServiceKey \
  --value "$LANGUAGE_KEY"

# OpenAI キー
OPENAI_KEY=$(az cognitiveservices account keys list \
  --name openai-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name OpenAIKey \
  --value "$OPENAI_KEY"

# AI Search キー
SEARCH_KEY=$(az search admin-key show \
  --service-name search-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query primaryKey -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name SearchServiceKey \
  --value "$SEARCH_KEY"
```

### 3. Functions App の Managed Identity 設定

```bash
FUNCTION_APP_NAME="func-salesanalytics-dev"

# システム割り当てマネージド ID を有効化
az functionapp identity assign \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP

# Managed Identity のプリンシパル ID を取得
PRINCIPAL_ID=$(az functionapp identity show \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)
```

### 4. RBAC ロールの付与

```bash
# Key Vault Secrets User
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list

# Storage Blob Data Contributor
STORAGE_ID=$(az storage account show \
  --name stgalesanalyticsdev \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv)

az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Storage Blob Data Contributor" \
  --scope $STORAGE_ID

# Cosmos DB Built-in Data Contributor
COSMOS_ID=$(az cosmosdb show \
  --name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv)

az cosmosdb sql role assignment create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --principal-id $PRINCIPAL_ID \
  --role-definition-name "Cosmos DB Built-in Data Contributor" \
  --scope $COSMOS_ID

# Search Index Data Contributor
SEARCH_ID=$(az search service show \
  --name search-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query id -o tsv)

az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Search Index Data Contributor" \
  --scope $SEARCH_ID
```

### 5. Functions App の環境変数設定

```bash
# Application Settings の設定
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    FUNCTIONS_WORKER_RUNTIME=dotnet-isolated \
    CosmosDbDatabaseName=SalesAnalytics \
    CosmosDbSessionsContainerName=sessions \
    CosmosDbAuditContainerName=label_audit \
    BlobContainerName=audio-uploads \
    SpeechServiceEndpoint=https://japaneast.api.cognitive.microsoft.com/ \
    LanguageServiceEndpoint=https://japaneast.api.cognitive.microsoft.com/ \
    OpenAIEndpoint=https://openai-salesanalytics-dev.openai.azure.com/ \
    OpenAIDeploymentName=gpt-4o \
    SearchServiceEndpoint=https://search-salesanalytics-dev.search.windows.net \
    SearchIndexName=sessions-index \
    KeyVaultUri=https://kv-salesanalytics-dev.vault.azure.net/

# Key Vault 参照形式での設定（推奨）
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    CosmosDbConnectionString="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/CosmosDbConnectionString/)" \
    BlobStorageConnectionString="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/BlobStorageConnectionString/)" \
    SpeechServiceKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/SpeechServiceKey/)" \
    LanguageServiceKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/LanguageServiceKey/)" \
    OpenAIKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/OpenAIKey/)" \
    SearchServiceKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/SearchServiceKey/)"
```

### 6. Functions App のデプロイ

```bash
# ビルドと発行
cd api/FunctionsApp
dotnet publish -c Release -o ./bin/publish

# Azure へデプロイ
cd bin/publish
func azure functionapp publish $FUNCTION_APP_NAME --dotnet-isolated
```

または VS Code から：
1. Azure Functions 拡張機能をインストール
2. サイドバーの Azure アイコンをクリック
3. Functions App を右クリック → "Deploy to Function App"

### 7. フロントエンド（Static Web Apps）のデプロイ

```bash
# Static Web App の作成
az staticwebapp create \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --location eastasia \
  --sku Free

# デプロイトークンの取得
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey -o tsv)

# GitHub Actions でデプロイ（または手動デプロイ）
cd frontend
npm install -g @azure/static-web-apps-cli

swa deploy ./out \
  --deployment-token $DEPLOYMENT_TOKEN \
  --env production
```

### 8. 環境変数の設定（Static Web Apps）

```bash
# Application Settings
az staticwebapp appsettings set \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --setting-names \
    NEXT_PUBLIC_API_BASE_URL=https://func-salesanalytics-dev.azurewebsites.net/api \
    AZURE_AD_CLIENT_ID=<your-client-id> \
    AZURE_AD_TENANT_ID=<your-tenant-id> \
    AZURE_AD_CLIENT_SECRET=<your-client-secret>
```

### 9. Cosmos DB のコンテナ作成

```bash
# データベース作成
az cosmosdb sql database create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --name SalesAnalytics

# sessions コンテナ作成
az cosmosdb sql container create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --database-name SalesAnalytics \
  --name sessions \
  --partition-key-path /userId \
  --throughput 400

# label_audit コンテナ作成
az cosmosdb sql container create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --database-name SalesAnalytics \
  --name label_audit \
  --partition-key-path /sessionId \
  --throughput 400
```

### 10. AI Search インデックスの作成

```bash
# インデックス定義 JSON ファイルを作成（sessions-index.json）
# Azure Portal または REST API でインデックスを作成
az search index create \
  --service-name search-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --name sessions-index \
  --fields @infra/search-index-schema.json
```

### 11. Application Insights の確認

```bash
# Application Insights の接続文字列を取得
APPINSIGHTS_CONN=$(az monitor app-insights component show \
  --app appi-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

# Functions App に設定
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    APPLICATIONINSIGHTS_CONNECTION_STRING="$APPINSIGHTS_CONN"
```

### 12. 動作確認

```bash
# Functions App のエンドポイント確認
az functionapp show \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName -o tsv

# Static Web Apps のエンドポイント確認
az staticwebapp show \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostname -o tsv

# ログストリーミング
az functionapp log tail \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

### PowerShell での一括設定スクリプト例

```powershell
# 変数設定
$ResourceGroup = "rg-salesanalytics-dev"
$Location = "japaneast"
$FunctionAppName = "func-salesanalytics-dev"
$KeyVaultName = "kv-salesanalytics-dev"

# Managed Identity 有効化と RBAC 設定
$principalId = (az functionapp identity assign `
  --name $FunctionAppName `
  --resource-group $ResourceGroup `
  --query principalId -o tsv)

# Key Vault アクセス許可
az keyvault set-policy `
  --name $KeyVaultName `
  --object-id $principalId `
  --secret-permissions get list

Write-Host "✅ Azure リソースの設定が完了しました"
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
