using Microsoft.Graph;
using Microsoft.Graph.Models;
using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;

namespace FunctionsApp.Data;

public class SharePointRepository : ISharePointRepository
{
    private readonly GraphServiceClient _graphClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SharePointRepository> _logger;
    private readonly string _siteId;
    private readonly string _driveId;

    public SharePointRepository(IConfiguration configuration, ILogger<SharePointRepository> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var tenantId = _configuration["SharePoint:TenantId"] 
            ?? throw new InvalidOperationException("SharePoint:TenantId is not configured");
        var clientId = _configuration["SharePoint:ClientId"]
            ?? throw new InvalidOperationException("SharePoint:ClientId is not configured");
        var clientSecret = _configuration["SharePoint:ClientSecret"]
            ?? throw new InvalidOperationException("SharePoint:ClientSecret is not configured");

        var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        _graphClient = new GraphServiceClient(credential);

        // サイトIDとドライブIDは初期化時に取得（後で実装）
        _siteId = string.Empty;
        _driveId = string.Empty;
    }

    /// <summary>
    /// SharePoint サイトとドライブを初期化
    /// </summary>
    public async Task InitializeAsync()
    {
        try
        {
            var siteUrl = _configuration["SharePoint:SiteUrl"]
                ?? throw new InvalidOperationException("SharePoint:SiteUrl is not configured");
            var libraryName = _configuration["SharePoint:LibraryName"]
                ?? throw new InvalidOperationException("SharePoint:LibraryName is not configured");

            // サイトURLからサイトIDを取得
            var uri = new Uri(siteUrl);
            var hostname = uri.Host;
            var sitePath = uri.AbsolutePath;

            var site = await _graphClient.Sites[$"{hostname}:{sitePath}"].GetAsync();
            if (site?.Id == null)
            {
                throw new InvalidOperationException($"SharePoint site not found: {siteUrl}");
            }

            _logger.LogInformation($"SharePoint site initialized: {site.Id}");

            // ドライブ（ドキュメントライブラリ）を取得
            var drives = await _graphClient.Sites[site.Id].Drives.GetAsync();
            var drive = drives?.Value?.FirstOrDefault(d => d.Name == libraryName);

            if (drive?.Id == null)
            {
                throw new InvalidOperationException($"SharePoint library not found: {libraryName}");
            }

            _logger.LogInformation($"SharePoint drive initialized: {drive.Id}");

            // リフレクションを使用してreadonlyフィールドに値を設定
            var siteIdField = typeof(SharePointRepository).GetField("_siteId", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            var driveIdField = typeof(SharePointRepository).GetField("_driveId", 
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            siteIdField?.SetValue(this, site.Id);
            driveIdField?.SetValue(this, drive.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to initialize SharePoint: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// 店舗フォルダを取得または作成
    /// </summary>
    private async Task<string> EnsureStoreFolderAsync(string storeId)
    {
        try
        {
            // ルートフォルダ直下の店舗フォルダを検索
            var items = await _graphClient.Drives[_driveId].Items["root"].Children.GetAsync(requestConfig =>
            {
                requestConfig.QueryParameters.Filter = $"name eq '{storeId}' and folder ne null";
            });

            var folder = items?.Value?.FirstOrDefault();
            if (folder?.Id != null)
            {
                return folder.Id;
            }

            // フォルダが存在しない場合は作成
            var newFolder = new DriveItem
            {
                Name = storeId,
                Folder = new Folder(),
                AdditionalData = new Dictionary<string, object>
                {
                    { "@microsoft.graph.conflictBehavior", "rename" }
                }
            };

            var created = await _graphClient.Drives[_driveId].Items["root"].Children.PostAsync(newFolder);
            if (created?.Id == null)
            {
                throw new InvalidOperationException($"Failed to create folder: {storeId}");
            }

            _logger.LogInformation($"Created SharePoint folder: {storeId}");
            return created.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to ensure store folder {storeId}: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// ドキュメントをアップロード（ISharePointRepository 実装）
    /// </summary>
    public async Task<string> UploadDocumentAsync(string fileName, string content)
    {
        // デフォルトのstoreIdを使用（実際の実装では引数から取得）
        return await UploadTranscriptAsync("default-store", fileName, content);
    }

    /// <summary>
    /// Markdownファイルをアップロード
    /// </summary>
    public async Task<string> UploadTranscriptAsync(string storeId, string fileName, string markdownContent)
    {
        try
        {
            if (string.IsNullOrEmpty(_siteId) || string.IsNullOrEmpty(_driveId))
            {
                await InitializeAsync();
            }

            var folderId = await EnsureStoreFolderAsync(storeId);

            // Markdownをバイト配列に変換
            var contentBytes = Encoding.UTF8.GetBytes(markdownContent);
            using var stream = new MemoryStream(contentBytes);

            // ファイルをアップロード
            var uploadedFile = await _graphClient.Drives[_driveId]
                .Items[folderId]
                .ItemWithPath(fileName)
                .Content
                .PutAsync(stream);

            if (uploadedFile?.WebUrl == null)
            {
                throw new InvalidOperationException($"Failed to upload file: {fileName}");
            }

            _logger.LogInformation($"Uploaded transcript to SharePoint: {uploadedFile.WebUrl}");
            return uploadedFile.WebUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to upload transcript {fileName}: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// ファイルの共有リンクを取得
    /// </summary>
    public async Task<string> GetShareLinkAsync(string storeId, string fileName)
    {
        try
        {
            var folderId = await EnsureStoreFolderAsync(storeId);
            
            var items = await _graphClient.Drives[_driveId].Items[folderId].Children.GetAsync(requestConfig =>
            {
                requestConfig.QueryParameters.Filter = $"name eq '{fileName}'";
            });

            var file = items?.Value?.FirstOrDefault();
            if (file?.Id == null)
            {
                throw new InvalidOperationException($"File not found: {fileName}");
            }

            // 閲覧専用の共有リンクを作成
            var permission = new Microsoft.Graph.Drives.Item.Items.Item.CreateLink.CreateLinkPostRequestBody
            {
                Type = "view",
                Scope = "organization"
            };

            var link = await _graphClient.Drives[_driveId].Items[file.Id].CreateLink.PostAsync(permission);
            
            if (link?.Link?.WebUrl == null)
            {
                throw new InvalidOperationException($"Failed to create share link for: {fileName}");
            }

            return link.Link.WebUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to get share link for {fileName}: {ex.Message}");
            throw;
        }
    }
}
