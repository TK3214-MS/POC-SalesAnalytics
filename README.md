# Sales Analytics - MVP

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

## 技術スタック

**Frontend**
- Next.js 16.0.10（App Router）
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS v4
- Base UI (@base-ui/react)
- pnpm 10.26.0

**Backend**
- Azure Functions v4 (.NET 8 Isolated)
- Durable Functions
- Azure AI Speech（文字起こし + 話者分離）
- Azure AI Language（PII検出、感情分析）
- Azure OpenAI（GPT-4o要約）
- Azure AI Search（ベクトル検索）
- Azure Cosmos DB（NoSQL）
- Azure Blob Storage（音声ファイル一時保存）
- Azure Key Vault（Secrets管理）

## セットアップ

### 前提条件
- Node.js 20.x以上
- .NET 8 SDK
- Azure CLI
- corepack有効化（`corepack enable`）

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

## MVP 対象外（TODO）
以下は将来拡張としてTODOコメントに記載：
- Repeat（90日）ワークフロー・通知
- Playbook バージョン管理
- 保持延長UI（最大1年）
- Blob Lifecycle ポリシー高度設定

## セキュリティ・コンプライアンス

- **Secrets管理**：Key Vault + Managed Identity（コードにSecrets記載禁止）
- **RBAC**：
  - Sales：自分のsessionのみ読み書き
  - Manager：自店舗sessionの承認のみ
  - Auditor：全session閲覧のみ（書き込み不可）
- **監査ログ**：追記専用（更新/削除禁止）
- **入力バリデーション**：
  - .NET：FluentValidation
  - TypeScript：Zod
- **エラー**：traceId付きで返却
- **LLM**：JSON Schema強制 + プロンプトインジェクション対策

## ライセンス

MIT

## 貢献

Issue・PRを歓迎します。

## サポート

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) および [docs/ENV.md](docs/ENV.md) を参照。
