// TODO: Azure リソース展開用 Bicep テンプレート

targetScope = 'subscription'

@description('環境名 (dev, prod)')
param environment string = 'dev'

@description('デプロイリージョン')
param location string = 'japaneast'

@description('リソースグループ名')
param resourceGroupName string = 'rg-salesanalytics-${environment}'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

// TODO: 以下のリソースを追加
// - Azure Cosmos DB (NoSQL API)
//   - Database: SalesAnalytics
//   - Containers: sessions (partition: /userId), label_audit (partition: /sessionId)
// - Azure Blob Storage
//   - Container: audio-uploads
//   - Lifecycle policy: 削除ルール（解析完了後）
// - Azure Functions (Consumption Plan / Premium Plan)
//   - Runtime: .NET 8 Isolated
//   - Managed Identity 有効化
// - Azure AI Speech
// - Azure AI Language
// - Azure OpenAI
//   - Deployment: gpt-4o
// - Azure AI Search
//   - Index: sessions-index
// - Azure Key Vault
//   - Secrets: 接続文字列・キー
//   - アクセスポリシー: Functions Managed Identity
// - Application Insights
//   - ログ・メトリクス収集

output resourceGroupName string = rg.name
output location string = location
