# デモモード機能 詳細ガイド

## 概要

POC-SalesAnalytics プロジェクトには、**Azureへの接続なし**でエンドツーエンドのデモを実行できる機能が実装されています。

## アーキテクチャ

### バックエンド構造

```
api/FunctionsApp/
├── AI/
│   ├── IOpenAIClient.cs          # インターフェース
│   ├── ISpeechClient.cs
│   ├── ILanguageClient.cs
│   ├── OpenAIClient.cs           # Azure実装
│   ├── SpeechClient.cs
│   ├── LanguageClient.cs
│   └── Mock/
│       ├── MockOpenAIClient.cs   # デモモード実装
│       ├── MockSpeechClient.cs
│       └── MockLanguageClient.cs
├── Data/
│   ├── ICosmosRepository.cs      # インターフェース
│   ├── IBlobRepository.cs
│   ├── ISearchRepository.cs
│   ├── ISharePointRepository.cs
│   ├── CosmosRepository.cs       # Azure実装
│   ├── BlobRepository.cs
│   ├── SearchRepository.cs
│   ├── SharePointRepository.cs
│   └── Mock/
│       ├── MockCosmosRepository.cs    # デモモード実装（インメモリ）
│       ├── MockBlobRepository.cs
│       ├── MockSearchRepository.cs
│       └── MockSharePointRepository.cs
└── Program.cs                    # DI設定（モード判定）
```

### モード切替の仕組み

**Program.cs** で環境変数 `DEMO_MODE` を判定し、DIコンテナに適切な実装を登録：

```csharp
var isDemoMode = context.Configuration["DEMO_MODE"]?.ToLower() == "true";

if (isDemoMode)
{
    // モックサービスを登録
    services.AddSingleton<ISpeechClient, MockSpeechClient>();
    services.AddSingleton<IOpenAIClient, MockOpenAIClient>();
    // ...
}
else
{
    // Azure実装を登録
    services.AddSingleton<ISpeechClient, SpeechClient>();
    services.AddSingleton<IOpenAIClient, OpenAIClient>();
    // ...
}
```

## デモモードの機能

### 1. AI サービス（モック）

| サービス | 実装内容 |
|---------|---------|
| **Speech（文字起こし）** | あらかじめ用意された会話データを返す（話者2名、7～8セグメント） |
| **Language（PII検出）** | 簡易的な文字列置換で個人情報をマスク |
| **Language（感情分析）** | 固定の感情スコアを返す（positive, neutral等） |
| **OpenAI（要約）** | 事前定義された構造化要約JSON（keyPoints, concerns等）を返す |

### 2. データストレージ（モック）

| サービス | 実装内容 |
|---------|---------|
| **Cosmos DB** | `ConcurrentDictionary` によるインメモリストレージ |
| **Blob Storage** | メモリ上にバイト配列を保持、URLは擬似的に生成 |
| **Azure Search** | インデックス化をログ出力のみでスキップ |
| **SharePoint** | 擬似URLを返し、実際のアップロードはスキップ |

### 3. フロントエンド（モック）

- `localStorage` に `appMode` を保存（`demo` または `production`）
- デモモード時、API呼び出しをローカルでインターセプトし、モックレスポンスを返す
- 主なエンドポイント：
  - `/ListMySessions` → 2件のデモセッションを返す
  - `/GetSession/{id}` → 文字起こし、要約、感情データを含むセッション詳細を返す
  - `/UploadAudio` → 成功メッセージとセッションIDを返す

## セットアップ方法

### バックエンド

1. **local.settings.json** を編集：
```json
{
  "Values": {
    "DEMO_MODE": "true"
  }
}
```

2. Functions を起動：
```bash
cd api/FunctionsApp
func start
```

起動時に以下が表示されます：
```
🎭 DEMO MODE: Using mock services (no Azure connection required)
```

### フロントエンド

1. 依存関係をインストール：
```bash
cd frontend
pnpm install
```

2. 開発サーバーを起動：
```bash
pnpm dev
```

3. ブラウザで `http://localhost:3000` を開く

4. 左サイドバー下部のトグルスイッチで **🎭 デモモード** を選択

## 本番モードへの切替

### バックエンド

1. **local.settings.json** を編集：
```json
{
  "Values": {
    "DEMO_MODE": "false",
    "CosmosDbConnectionString": "YOUR_COSMOS_CONNECTION_STRING",
    "BlobStorageConnectionString": "YOUR_BLOB_CONNECTION_STRING",
    "OpenAIEndpoint": "YOUR_OPENAI_ENDPOINT",
    ...
  }
}
```

2. Functions を再起動

起動時に以下が表示されます：
```
☁️  PRODUCTION MODE: Using Azure services
```

### フロントエンド

左サイドバー下部のトグルスイッチで **☁️ 本番モード** を選択

## メリット

### 1. 開発効率の向上
- Azureリソース不要で即座に開発開始可能
- CI/CDパイプラインでのテストが容易

### 2. デモ・プレゼンテーション
- インターネット接続なしでデモ実施可能
- 安定したデータで再現性の高いデモが可能

### 3. コスト削減
- 開発・テスト時のAzureコストを削減
- 複数開発者が同時に作業可能（Azureリソース競合なし）

### 4. 本番移行が容易
- コードは1行も削除していない
- 環境変数とUIトグルのみで切替

## デモデータ詳細

### サンプル会話（MockSpeechClient）

**話者0（営業担当）**
- "いらっしゃいませ。本日はどのようなお車をお探しですか？"
- "ご家族構成は何名様でしょうか？"
- "それでしたら、こちらのSUVモデルはいかがでしょうか..."
- （全8セグメント）

**話者1（顧客）**
- "こんにちは。家族向けのSUVを探しています。"
- "妻と子供3人の5人家族です。"
- "全部で400万円くらいを考えています。"
- （全8セグメント）

### サンプル要約（MockOpenAIClient）

```json
{
  "keyPoints": [
    "顧客は5人家族向けのSUVを探している",
    "予算は約400万円",
    "7人乗りの広々としたモデルに興味を示している"
  ],
  "concerns": [
    "安全性能の詳細確認が必要",
    "予算内で収まるかの検討中"
  ],
  "nextActions": [
    "来週土曜日10時に試乗予約",
    "ローンプラン詳細資料を準備"
  ]
}
```

## トラブルシューティング

### Q: デモモードなのにAzure接続エラーが出る
A: `local.settings.json` の `DEMO_MODE` が `"true"` （文字列）になっているか確認してください。

### Q: フロントエンドでモックデータが表示されない
A: ブラウザのLocalStorageで `appMode` が `"demo"` になっているか、開発者ツールで確認してください。

### Q: 本番モードに切り替えたのにモックデータが返ってくる
A: Functions を再起動してください（`DEMO_MODE` の変更は起動時のみ読み込まれます）。

## まとめ

このデモモード機能により、以下が実現できます：

✅ **オフラインデモ**: インターネット接続なしで全機能を体験  
✅ **開発加速**: Azure設定不要で即座に開発開始  
✅ **コスト削減**: 開発・テスト時のクラウドコストを最小化  
✅ **本番移行**: UIトグル1つで本番環境に切替可能  

デモモードと本番モードを使い分けることで、開発からデモ、本番運用まで、シームレスな開発体験を提供します。
