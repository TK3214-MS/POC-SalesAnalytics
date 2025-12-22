# SharePoint 連携セットアップガイド

このドキュメントでは、営業ロールプレイ教材用にトランスクリプトをSharePoint Onlineに自動アップロードするための設定手順を説明します。

## 前提条件

- Microsoft 365 テナント管理者権限
- SharePoint Online サイトへのアクセス権
- Azure AD (Microsoft Entra ID) でのアプリ登録権限

## 1. SharePoint サイトとドキュメントライブラリの準備

### 1.1 SharePoint サイトの作成または選択

1. SharePoint 管理センターにアクセス
2. 既存のサイトを使用するか、新しいサイトを作成
3. サイトのURLをメモ（例: `https://yourtenant.sharepoint.com/sites/SalesTraining`）

### 1.2 ドキュメントライブラリの作成

1. SharePoint サイトで「新規」→「ドキュメント ライブラリ」を選択
2. 名前: `RolePlayTranscripts`（または任意の名前）
3. 「作成」をクリック

### 1.3 フォルダ構造

システムは自動的に店舗ID（`storeId`）ごとにフォルダを作成します。

```
RolePlayTranscripts/
├── store-tokyo-001/
│   ├── transcript_store-tokyo-001_20250122-093000_session-abc123.md
│   └── transcript_store-tokyo-001_20250122-143000_session-def456.md
├── store-osaka-001/
│   └── transcript_store-osaka-001_20250122-100000_session-ghi789.md
└── ...
```

## 2. Azure AD アプリ登録

### 2.1 アプリの登録

1. [Azure Portal](https://portal.azure.com) にアクセス
2. 「Microsoft Entra ID」→「アプリの登録」→「新規登録」
3. 以下を入力:
   - 名前: `SalesAnalytics-SharePoint-Integration`
   - サポートされているアカウントの種類: `この組織ディレクトリのみに含まれるアカウント`
   - リダイレクトURI: 空欄でOK
4. 「登録」をクリック

### 2.2 クライアントシークレットの作成

1. 作成したアプリの「証明書とシークレット」を選択
2. 「新しいクライアント シークレット」をクリック
3. 説明: `SharePoint Access Secret`
4. 有効期限: 推奨は24ヶ月
5. 「追加」をクリック
6. **シークレット値をコピーして安全に保存**（後で確認できません）

### 2.3 必要な情報をメモ

以下の情報を「概要」ページからコピー:
- **アプリケーション (クライアント) ID**
- **ディレクトリ (テナント) ID**
- **クライアント シークレット値**（前ステップでコピー）

## 3. SharePoint のアクセス許可設定

### 3.1 API のアクセス許可を追加

1. アプリの「APIのアクセス許可」を選択
2. 「アクセス許可の追加」をクリック
3. 「Microsoft Graph」を選択
4. 「アプリケーションの許可」を選択
5. 以下のアクセス許可を追加:
   - `Sites.ReadWrite.All` - SharePoint サイトへの読み取りと書き込み
   - `Files.ReadWrite.All` - ファイルの読み取りと書き込み
6. 「アクセス許可の追加」をクリック
7. **「[テナント名] に管理者の同意を与えます」をクリック**（必須）

### 3.2 SharePoint サイトへのアクセス権付与

#### オプション1: サイトコレクション管理者として追加

1. SharePoint サイトの「設定」→「サイトの権限」
2. 「アクセス許可の付与」をクリック
3. アプリのクライアントIDを入力: `<ClientId>@<TenantId>`
   - 例: `12345678-1234-1234-1234-123456789abc@87654321-4321-4321-4321-cba987654321`
4. 権限レベル: `フル コントロール`
5. 「共有」をクリック

#### オプション2: PowerShell で付与（推奨）

```powershell
# SharePoint Online Management Shell をインストール（初回のみ）
Install-Module -Name Microsoft.Online.SharePoint.PowerShell

# SharePoint に接続
Connect-SPOService -Url https://yourtenant-admin.sharepoint.com

# アプリにアクセス権を付与
Set-SPOSite -Identity https://yourtenant.sharepoint.com/sites/SalesTraining `
    -DenyAddAndCustomizePages 0

# または全サイトに対して
Register-SPOAppPrincipal -AppPrincipalId "<ClientId>" `
    -DisplayName "SalesAnalytics SharePoint Integration" `
    -Site https://yourtenant.sharepoint.com/sites/SalesTraining
```

## 4. Azure Functions の設定

### 4.1 ローカル開発環境

`local.settings.json` を作成（`local.settings.sample.json` をコピー）:

```json
{
  "Values": {
    "SharePoint:TenantId": "YOUR_TENANT_ID",
    "SharePoint:ClientId": "YOUR_CLIENT_ID",
    "SharePoint:ClientSecret": "YOUR_CLIENT_SECRET",
    "SharePoint:SiteUrl": "https://yourtenant.sharepoint.com/sites/SalesTraining",
    "SharePoint:LibraryName": "RolePlayTranscripts"
  }
}
```

### 4.2 Azure Functions アプリの設定

Azure Portal で Functions App の「構成」→「アプリケーション設定」に追加:

| 名前 | 値 |
|------|------|
| `SharePoint:TenantId` | `YOUR_TENANT_ID` |
| `SharePoint:ClientId` | `YOUR_CLIENT_ID` |
| `SharePoint:ClientSecret` | `YOUR_CLIENT_SECRET` |
| `SharePoint:SiteUrl` | `https://yourtenant.sharepoint.com/sites/SalesTraining` |
| `SharePoint:LibraryName` | `RolePlayTranscripts` |

**推奨**: Azure Key Vault を使用してシークレットを管理:

```json
{
  "SharePoint:ClientSecret": "@Microsoft.KeyVault(SecretUri=https://yourkeyvault.vault.azure.net/secrets/SharePointClientSecret/)"
}
```

## 5. 動作確認

### 5.1 手動テスト

1. Azure Functions をローカルで起動:
   ```bash
   cd api/FunctionsApp
   func start
   ```

2. 音声ファイルをアップロードして分析を実行

3. オーケストレーションが完了したら、Cosmos DB の `sessions` コレクションで `sharePointUrl` フィールドを確認

4. SharePoint サイトでファイルが作成されているか確認

### 5.2 トラブルシューティング

#### エラー: "SharePoint site not found"

- `SharePoint:SiteUrl` の値が正しいか確認
- サイトURLの形式: `https://<tenant>.sharepoint.com/sites/<sitename>`
- 末尾のスラッシュは不要

#### エラー: "SharePoint library not found"

- `SharePoint:LibraryName` の値がドキュメントライブラリ名と一致しているか確認
- ライブラリ名は表示名（例: `Documents`, `RolePlayTranscripts`）

#### エラー: "Access Denied"

1. API のアクセス許可が正しく設定されているか確認
2. 管理者の同意が付与されているか確認
3. SharePoint サイトへのアクセス権が付与されているか確認
4. クライアントシークレットの有効期限が切れていないか確認

#### ログの確認

Application Insights でログを確認:

```kusto
traces
| where message contains "SharePoint"
| order by timestamp desc
| take 50
```

## 6. Copilot Studio Lite との連携

### 6.1 SharePoint データソースの追加

1. [Copilot Studio](https://copilotstudio.microsoft.com/) にアクセス
2. 新しいエージェントを作成または既存のエージェントを選択
3. 「Knowledge」→「Add knowledge」を選択
4. 「SharePoint」を選択
5. 以下を設定:
   - サイトURL: `https://yourtenant.sharepoint.com/sites/SalesTraining`
   - ドキュメントライブラリ: `RolePlayTranscripts`
   - フィルター: 特定の店舗フォルダのみを対象にする場合は設定

### 6.2 エージェントの設定

トピックやプロンプトで以下のような指示を追加:

```
あなたは営業トレーニングのためのロールプレイエージェントです。
SharePointに保存されているトランスクリプトを参照して、
顧客役として自然な応答を生成してください。

実際の商談事例をもとに、以下の点を意識してください:
- 成功事例から学んだ効果的な対応パターン
- 失注事例から学んだ避けるべき対応
- 感情分析の結果を踏まえた適切な反応

販売員の発言に対して、リアルな顧客としてフィードバックを提供してください。
```

### 6.3 ロールプレイの実施

1. 販売員がCopilot Studioのチャットインターフェースにアクセス
2. エージェントが自動的にSharePointのトランスクリプトを参照
3. 実際の商談シナリオに基づいたロールプレイを実施
4. エージェントからリアルタイムでフィードバックを受け取る

## 7. セキュリティのベストプラクティス

### 7.1 アクセス制御

- SharePoint フォルダに適切なアクセス権を設定
- 店舗ごとに異なるアクセス権を設定する場合は、SharePoint のアクセス許可を活用

### 7.2 データ保持ポリシー

SharePoint でデータ保持ポリシーを設定:

1. SharePoint 管理センター→「ポリシー」→「保持」
2. 新しい保持ポリシーを作成
3. 対象: `RolePlayTranscripts` ライブラリ
4. 保持期間: 例えば1年後に自動削除

### 7.3 監査ログ

SharePoint の監査ログを有効化:

1. SharePoint 管理センター→「設定」→「詳細設定」
2. 「監査」セクションで監査ログを有効化
3. ファイルのアップロード、ダウンロード、削除をログに記録

### 7.4 シークレットのローテーション

- クライアントシークレットは定期的に更新（推奨: 6ヶ月〜1年）
- Azure Key Vault でシークレットのバージョン管理を実施

## 8. パフォーマンス最適化

### 8.1 並列処理

現在の実装では、SharePointアップロードが失敗してもオーケストレーション全体は失敗しません:

```csharp
catch (Exception ex)
{
    // SharePointアップロードが失敗してもオーケストレーション全体は失敗させない
    logger.LogWarning($"Failed to upload to SharePoint (non-critical): {ex.Message}");
}
```

### 8.2 リトライポリシー

Microsoft Graph SDK は自動的にリトライを実行しますが、カスタマイズも可能:

```csharp
var retryHandler = new RetryHandler(new RetryHandlerOption
{
    MaxRetry = 3,
    Delay = 2
});
```

## まとめ

この設定により:

1. ✅ 音声分析完了後、自動的にSharePointにトランスクリプトがアップロード
2. ✅ 店舗ごとにフォルダが自動作成され、整理された状態で保存
3. ✅ Copilot Studio Liteがトランスクリプトを参照し、リアルなロールプレイが可能
4. ✅ セキュアな認証・認可により、データが安全に管理される

何か問題が発生した場合は、Application Insights のログを確認してください。
