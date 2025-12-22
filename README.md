# Sales Analytics - MVP

> **Language**: [English](README.en.md) | [日本語](README.md)

自動車ディーラー向け商談音声分析システム（MVP版）

## 概要

商談音声（対面録音・日本語）をアップロードし、以下を自動実行：
- 文字起こし（話者分離）
- PII（個人情報）マスキング
- 感情分析
- LLM要約（構造化JSON）
- RAG類似商談検索
- Outcome（成約/失注/保留/中止）二段階承認ワークフロー
- KPIダッシュボード（成約率等）
- **SharePoint Online連携（営業ロールプレイ教材の自動生成）**

## 技術スタック

**Frontend**
- Next.js 16.0.10（App Router）
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS v4.1.10
- Base UI (@base-ui/react) 1.0.0
- pnpm 10.26.0
- Zod 3.24.1（バリデーション）
- date-fns 4.1.0（日付処理）
- recharts 2.15.0（グラフ表示）
- デザイン:クリーンなホワイト/ブラック基調
- アイコン:/frontend/public/assets/logo 配下のPNG画像(case.png, KPI.png, Voice.png, Approval.png)
- ファビコン:Top.png

**Backend**
- Azure Functions v4 (.NET 8 Isolated)
  - Azure Functions Worker: 1.24.0
  - Worker SDK: 1.18.1
  - Durable Task Extensions: 1.1.5
- Azure AI Services
  - Azure AI Speech（文字起こし + 話者分離）
  - Azure AI Language（PII検出、感情分析）v5.3.0
  - Azure OpenAI（GPT-4o要約）v2.1.0
- Azure Data & Storage
  - Azure AI Search（ベクトル検索）v11.7.0
  - Azure Cosmos DB（NoSQL）v3.45.0
  - Azure Blob Storage（音声ファイル一時保存）v12.23.0
  - Azure Key Vault（Secrets管理）v4.8.0
- SharePoint 連携
  - Microsoft Graph v5.86.0（SharePoint Online API）
- バリデーション & ユーティリティ
  - FluentValidation v11.11.0

## セットアップ

### 前提条件
- Node.js 20.x以上
- .NET 8 SDK（8.0.404以上推奨）
- Azure Functions Core Tools 4.6.0以上
- Azure CLI
- corepack有効化（`corepack enable`）
- Azurite（ローカル開発時のストレージエミュレータ）

### 1. リポジトリクローン
```bash
git clone https://github.com/yourusername/POC-SalesAnalytics.git
cd POC-SalesAnalytics
```

### 2. フロントエンド
```bash
cd frontend
corepack enable
pnpm install
cp .env.example .env.local
# .env.local に必要な環境変数を設定（docs/ENV.md参照）
pnpm dev
```

ブラウザで `http://localhost:3000` を開く。

### 3. バックエンド
```bash
cd api/FunctionsApp
cp local.settings.sample.json local.settings.json
# local.settings.json に必要な接続文字列等を設定（docs/ENV.md参照）
dotnet restore
dotnet build
func start
```

Functions は `http://localhost:7071` で起動。

**注意事項 (Windows ARM64 環境)**

Windows ARM64 環境では、Azure Functions Core Tools 4.6.0 の既知の問題により、以下のエラーメッセージが表示される場合があります：

```
Could not load file or assembly 'Microsoft.Azure.Functions.Platform.Metrics.LinuxConsumption'
```

このエラーメッセージは表示されますが、Functionsは正常に動作します。以下のいずれかの方法で対処できます：

1. **VS Code タスクから実行**（推奨）
   - VS Codeで `Ctrl+Shift+P` → `Tasks: Run Task` → `build (functions)` を実行
   - その後、自動的に Functions が起動します

2. **ビルド出力ディレクトリから直接実行**
   ```bash
   cd api/FunctionsApp
   dotnet build
   cd bin/Debug/net8.0
   func host start
   ```

3. **Docker コンテナで実行**
   ```bash
   docker build -t salesanalytics-api .
   docker run -p 7071:80 salesanalytics-api
   ```

### 4. Azure リソース展開（開発環境）
```bash
cd infra
az login
az deployment sub create \
  --location japaneast \
  --template-file main.bicep \
  --parameters params.dev.json
```

## ディレクトリ構成

```
POC-SalesAnalytics/
├── frontend/          # Next.js App Router
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── package.json   # pnpm固定
│   └── pnpm-lock.yaml
├── api/
│   └── FunctionsApp/  # Azure Functions (.NET 8 Isolated)
│       ├── Http/      # HTTP Triggers
│       ├── Orchestrations/
│       ├── Activities/
│       ├── AI/        # Azure AI Client
│       ├── Data/      # Repository
│       └── Shared/
├── infra/             # Bicep IaC
├── docs/
│   ├── ARCHITECTURE.md
│   └── ENV.md
└── .github/workflows/ # CI/CD
```

## 主要機能

### 1. 同意取得（必須）
音声アップロード前にUIで同意チェックボックス必須。同意なしはアップロード不可。

### 2. 文字起こし + 話者分離
Azure AI Speech（Diarization）で話者を自動識別。

### 3. PII マスキング
Azure AI Language で個人情報を検出し、索引前に必ずマスク。

### 4. 感情分析
文字起こしテキストに対して感情（positive/neutral/negative）を判定。

### 5. LLM 要約
Azure OpenAI（GPT-4o）でJSON構造化出力：
- 要点（keyPoints）
- 顧客懸念（concerns）
- 次アクション（nextActions）
- 成功観点（successFactors）
- 改善観点（improvementAreas）
- 引用（quotations：speakerSegmentId + timeRange）

### 6. Outcome 二段階承認ワークフロー
- **Sales**：自分の商談に対して Outcome（won/lost/pending/canceled）を申請
- **Manager**：同一店舗（storeId）の申請のみ承認可能
- **期限**：商談後7日以内に確定。超過時はManagerのみ例外承認可（理由必須、監査ログにOVERRIDE記録）
- **監査ログ（label_audit）**：追記専用（更新/削除禁止）

### 7. KPI ダッシュボード
- 成約率 = won / (won + lost)
- 店舗別、販売員別、期間別で集計
- サンプル数も併記

### 8. RAG 類似商談検索
Azure AI Search でベクトル索引・検索（最小実装）。

### 9. SharePoint Online連携（営業ロールプレイ教材）
音声分析完了後、自動的にMarkdown形式のトランスクリプトをSharePoint Onlineにアップロード：
- **Markdownコンテンツ**：基本情報、会話トランスクリプト、感情分析、AI要約、成約結果、ロールプレイガイドを含む
- **自動フォルダ作成**：店舗ID（storeId）ごとにフォルダを自動生成
- **セキュア認証**：Azure AD (Microsoft Entra ID) アプリ登録によるクライアント認証
- **Copilot Studio Lite連携**：SharePointに保存されたトランスクリプトを参照し、AIエージェントによるリアルな営業ロールプレイが可能

詳細なセットアップ手順は [docs/SHAREPOINT_SETUP.md](docs/SHAREPOINT_SETUP.md) を参照。

## MVP 対象外（TODO）
以下は将来拡張としてTODOコメントに記載：
- Repeat（90日）ワークフロー・通知
- Playbook バージョン管理
- 保持延長UI（最大1年）
- Blob Lifecycle ポリシー高度設定

## 既知の問題・制限事項

### Windows ARM64 環境
- Azure Functions Core Tools 4.6.0 では、以下のエラーメッセージが表示されることがありますが、動作に影響はありません：
  ```
  Could not load file or assembly 'Microsoft.Azure.Functions.Platform.Metrics.LinuxConsumption'
  ```
- 推奨: VS Code タスクまたはビルド出力ディレクトリから直接実行

### パッケージバージョンの互換性
- Azure Functions Worker SDK v2.0.0 は Core Tools 4.6.0 と互換性の問題があるため、v1.18.1 を使用
- Azure.AI.OpenAI v2.1.0 では API の変更があり、`OpenAI.Chat` 名前空間を使用する必要があります
- Azure.Search.Documents v11.8.0 は現時点で利用できないため、v11.7.0 を使用

## セキュリティ・コンプライアンス

- **Secrets管理**：Key Vault + Managed Identity（コードにSecrets記載禁止）
- **RBAC**：
  - Sales：自分のsessionのみ読み書き
  - Manager：自店舗sessionの承認のみ
  - Auditor：全session閲覧のみ（書き込み不可）
- **監査ログ**：追記専用（更新/削除禁止）
- **入力バリデーション**：
  - .NET：FluentValidation v11.11.0
  - TypeScript：Zod v3.24.1
- [SHAREPOINT_SETUP.md](docs/SHAREPOINT_SETUP.md) - SharePoint Online連携のセットアップ
- **エラー**：traceId付きで返却
- **LLM**：JSON Schema強制 + プロンプトインジェクション対策
- **PII保護**：Azure AI Language v5.3.0 で検出・マスキング後に索引

## 開発環境のセットアップ

詳細は以下のドキュメントを参照：
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - システムアーキテクチャの詳細
- [ENV.md](docs/ENV.md) - 環境変数とトラブルシューティング

## ライセンス

MIT

## 貢献

Issue・PRを歓迎します。

## サポート

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) および [docs/ENV.md](docs/ENV.md) を参照。
