# Environment Variables Setup Guide

> **Language**: [English](ENV.en.md) | [日本語](ENV.md)

## Frontend (`frontend/.env.local`)

```bash
# Next.js Public Variables (accessible on client-side)
NEXT_PUBLIC_API_BASE_URL=http://localhost:7071/api

# Server-side Only
AZURE_AD_CLIENT_ID=<your-azure-ad-client-id>
AZURE_AD_TENANT_ID=<your-azure-ad-tenant-id>
AZURE_AD_CLIENT_SECRET=<your-azure-ad-client-secret>
```

### Description
- `NEXT_PUBLIC_API_BASE_URL`: Backend Azure Functions base URL
- `AZURE_AD_CLIENT_ID`: Azure AD B2C / Entra ID client ID (for authentication)
- `AZURE_AD_TENANT_ID`: Tenant ID
- `AZURE_AD_CLIENT_SECRET`: Client secret (server-side only)

## Backend (`api/FunctionsApp/local.settings.json`)

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
    
    "SharePoint:TenantId": "<your-tenant-id>",
    "SharePoint:ClientId": "<your-sharepoint-app-client-id>",
    "SharePoint:ClientSecret": "<your-sharepoint-app-client-secret>",
    "SharePoint:SiteUrl": "https://<your-tenant>.sharepoint.com/sites/<site-name>",
    "SharePoint:LibraryName": "RolePlayTranscripts",
    
    "KeyVaultUri": "https://<your-keyvault>.vault.azure.net/"
  }
}
```

### Description
- `AzureWebJobsStorage`: Functions storage (Azurite available for local dev)
- `FUNCTIONS_WORKER_RUNTIME`: Use .NET Isolated
- **Cosmos DB**: Connection string, database name, container names
- **Blob Storage**: Temporary audio file storage
- **Speech Service**: Transcription + speaker diarization
- **Language Service**: PII detection, sentiment analysis
- **OpenAI**: GPT-4o summarization
- **AI Search**: Vector search
- **SharePoint**: Sales role-play transcript storage
  - `TenantId`: Microsoft Entra ID tenant ID
  - `ClientId`: SharePoint access app client ID
  - `ClientSecret`: App client secret
  - `SiteUrl`: SharePoint site full URL
  - `LibraryName`: Document library name (e.g., `RolePlayTranscripts`)
- **Key Vault**: Retrieve secrets via Managed Identity in production

## Production Environment (Azure)

### Using Managed Identity
In production, enable Functions App Managed Identity and retrieve secrets from Key Vault:

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

**Note**: When using Azure Functions Worker SDK 1.18.1, `Azure.Extensions.AspNetCore.Configuration.Secrets` v1.3.2 package is required.

### Key Vault Secrets
- `SharePointClientSecret` (SharePoint app client secret)
- `CosmosDbConnectionString`
- `BlobStorageConnectionString`
- `SpeechServiceKey`
- `LanguageServiceKey`
- `OpenAIKey`
- `SearchServiceKey`

### RBAC Configuration
Grant the following roles to Functions App Managed Identity:
- **Cosmos DB**: Cosmos DB Built-in Data Contributor
- **Blob Storage**: Storage Blob Data Contributor
- **Key Vault**: Key Vault Secrets User
- **AI Search**: Search Index Data Contributor

## Environment-Specific Parameters

### Dev Environment (`infra/params.dev.json`)
```json
{
  "environment": "dev",
  "location": "japaneast",
  "skuTier": "Basic"
}
```

### Production Environment (`infra/params.prod.json`)
```json
{
  "environment": "prod",
  "location": "japaneast",
  "skuTier": "Standard",
  "enableMultiRegion": true
}
```

## Azure Operations

### Prerequisites

Install the following tools:
```bash
# Azure CLI
winget install -e --id Microsoft.AzureCLI

# Azure Developer CLI (azd)
winget install -e --id Microsoft.Azd

# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Login to Azure:
```bash
az login
az account set --subscription "<your-subscription-id>"
```

### 1. Deploy Resources with Bicep

#### Deploy Dev Environment
```bash
# Create resource group
az group create --name rg-salesanalytics-dev --location japaneast

# Deploy Bicep template
az deployment sub create \
  --location japaneast \
  --template-file infra/main.bicep \
  --parameters infra/params.dev.json
```

#### Deploy Production Environment
```bash
az group create --name rg-salesanalytics-prod --location japaneast

az deployment sub create \
  --location japaneast \
  --template-file infra/main.bicep \
  --parameters infra/params.prod.json
```

### 2. Register Secrets in Key Vault

```bash
# Set variables
RESOURCE_GROUP="rg-salesanalytics-dev"
KEY_VAULT_NAME="kv-salesanalytics-dev"

# Cosmos DB connection string
COSMOS_CONN=$(az cosmosdb keys list \
  --name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --type connection-strings \
  --query "connectionStrings[0].connectionString" -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name CosmosDbConnectionString \
  --value "$COSMOS_CONN"

# Blob Storage connection string
BLOB_CONN=$(az storage account show-connection-string \
  --name stgalesanalyticsdev \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name BlobStorageConnectionString \
  --value "$BLOB_CONN"

# Speech Service key
SPEECH_KEY=$(az cognitiveservices account keys list \
  --name speech-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name SpeechServiceKey \
  --value "$SPEECH_KEY"

# Language Service key
LANGUAGE_KEY=$(az cognitiveservices account keys list \
  --name language-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name LanguageServiceKey \
  --value "$LANGUAGE_KEY"

# OpenAI key
OPENAI_KEY=$(az cognitiveservices account keys list \
  --name openai-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query key1 -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name OpenAIKey \
  --value "$OPENAI_KEY"

# AI Search key
SEARCH_KEY=$(az search admin-key show \
  --service-name search-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query primaryKey -o tsv)

az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name SearchServiceKey \
  --value "$SEARCH_KEY"

# SharePoint Client Secret (manual setup)
# Set client secret obtained from app registration in Azure Portal
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name SharePointClientSecret \
  --value "<your-sharepoint-client-secret>"
```

### 3. Configure Functions App Managed Identity

```bash
FUNCTION_APP_NAME="func-salesanalytics-dev"

# Enable system-assigned managed identity
az functionapp identity assign \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP

# Get principal ID of Managed Identity
PRINCIPAL_ID=$(az functionapp identity show \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)
```

### 4. Grant RBAC Roles

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

### 5. Configure Functions App Environment Variables

```bash
# Configure Application Settings
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
    KeyVaultUri=https://kv-salesanalytics-dev.vault.azure.net/ \
    "SharePoint:TenantId=<your-tenant-id>" \
    "SharePoint:ClientId=<your-sharepoint-client-id>" \
    "SharePoint:SiteUrl=https://<tenant>.sharepoint.com/sites/<site>" \
    "SharePoint:LibraryName=RolePlayTranscripts"

# Configure with Key Vault references (recommended)
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    CosmosDbConnectionString="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/CosmosDbConnectionString/)" \
    BlobStorageConnectionString="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/BlobStorageConnectionString/)" \
    SpeechServiceKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/SpeechServiceKey/)" \
    LanguageServiceKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/LanguageServiceKey/)" \
    OpenAIKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/OpenAIKey/)" \
    SearchServiceKey="@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/SearchServiceKey/)" \
    "SharePoint:ClientSecret=@Microsoft.KeyVault(SecretUri=https://kv-salesanalytics-dev.vault.azure.net/secrets/SharePointClientSecret/)"
```

**Note**: For detailed SharePoint integration setup instructions, see [SHAREPOINT_SETUP.en.md](SHAREPOINT_SETUP.en.md).

### 6. Deploy Functions App

```bash
# Build and publish
cd api/FunctionsApp
dotnet publish -c Release -o ./bin/publish

# Deploy to Azure
cd bin/publish
func azure functionapp publish $FUNCTION_APP_NAME --dotnet-isolated
```

Or from VS Code:
1. Install Azure Functions extension
2. Click Azure icon in sidebar
3. Right-click Functions App → "Deploy to Function App"

### 7. Deploy Frontend (Static Web Apps)

```bash
# Create Static Web App
az staticwebapp create \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --location eastasia \
  --sku Free

# Get deployment token
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query properties.apiKey -o tsv)

# Deploy with GitHub Actions (or manual deployment)
cd frontend
npm install -g @azure/static-web-apps-cli

swa deploy ./out \
  --deployment-token $DEPLOYMENT_TOKEN \
  --env production
```

### 8. Configure Environment Variables (Static Web Apps)

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

### 9. Create Cosmos DB Containers

```bash
# Create database
az cosmosdb sql database create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --name SalesAnalytics

# Create sessions container
az cosmosdb sql container create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --database-name SalesAnalytics \
  --name sessions \
  --partition-key-path /userId \
  --throughput 400

# Create label_audit container
az cosmosdb sql container create \
  --account-name cosmos-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --database-name SalesAnalytics \
  --name label_audit \
  --partition-key-path /sessionId \
  --throughput 400
```

### 10. Create AI Search Index

```bash
# Create index definition JSON file (sessions-index.json)
# Create index via Azure Portal or REST API
az search index create \
  --service-name search-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --name sessions-index \
  --fields @infra/search-index-schema.json
```

### 11. Verify Application Insights

```bash
# Get Application Insights connection string
APPINSIGHTS_CONN=$(az monitor app-insights component show \
  --app appi-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query connectionString -o tsv)

# Configure in Functions App
az functionapp config appsettings set \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    APPLICATIONINSIGHTS_CONNECTION_STRING="$APPINSIGHTS_CONN"
```

### 12. Verify Operation

```bash
# Verify Functions App endpoint
az functionapp show \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostName -o tsv

# Verify Static Web Apps endpoint
az staticwebapp show \
  --name swa-salesanalytics-dev \
  --resource-group $RESOURCE_GROUP \
  --query defaultHostname -o tsv

# Stream logs
az functionapp log tail \
  --name $FUNCTION_APP_NAME \
  --resource-group $RESOURCE_GROUP
```

### PowerShell Batch Setup Script Example

```powershell
# Set variables
$ResourceGroup = "rg-salesanalytics-dev"
$Location = "japaneast"
$FunctionAppName = "func-salesanalytics-dev"
$KeyVaultName = "kv-salesanalytics-dev"

# Enable Managed Identity and configure RBAC
$principalId = (az functionapp identity assign `
  --name $FunctionAppName `
  --resource-group $ResourceGroup `
  --query principalId -o tsv)

# Grant Key Vault access
az keyvault set-policy `
  --name $KeyVaultName `
  --object-id $principalId `
  --secret-permissions get list

Write-Host "✅ Azure resource configuration completed"
```

## Troubleshooting

### Required NuGet Packages

Main NuGet packages used in the project:

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

<!-- SharePoint Integration -->
<PackageReference Include="Microsoft.Graph" Version="5.86.0" />

<!-- Configuration & Extensions -->
<PackageReference Include="Microsoft.Extensions.Configuration.UserSecrets" Version="8.0.1" />
<PackageReference Include="Azure.Extensions.AspNetCore.Configuration.Secrets" Version="1.3.2" />
<PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.1" />
<PackageReference Include="Microsoft.ApplicationInsights.WorkerService" Version="2.22.0" />

<!-- Validation -->
<PackageReference Include="FluentValidation" Version="11.11.0" />
```

Install packages:
```bash
cd api/FunctionsApp
dotnet restore
```

### Azurite (Local Development)
On Windows, start Azurite separately:
```bash
npm install -g azurite
azurite --silent --location c:\azurite --debug c:\azurite\debug.log
```

### Cosmos DB Emulator
Cosmos DB Emulator can be used for local development:
```bash
# Connection string
AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
```

### Verify Functions Logs
```bash
cd api/FunctionsApp
func start --verbose
```

Check Application Insights logs in Azure Portal.

### Windows ARM64 Environment Issues

When running `func start` on Windows ARM64, you may see the following error:

```
Could not load file or assembly 'Microsoft.Azure.Functions.Platform.Metrics.LinuxConsumption'
```

**Solutions**:

1. **Run from VS Code Task** (recommended)
   - `Ctrl+Shift+P` → `Tasks: Run Task` → `build (functions)`
   - Functions will start automatically

2. **Run from build output directory**
   ```bash
   cd api/FunctionsApp
   dotnet build
   cd bin/Debug/net8.0
   func host start
   ```

3. **Ignore error message**
   - Error message appears but Functions operate normally
   - Verify endpoints are running at `http://localhost:7071`

This is a known limitation of Azure Functions Core Tools 4.6.0 on Windows ARM64 environments.
