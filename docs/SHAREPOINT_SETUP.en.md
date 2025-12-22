# SharePoint Integration Setup Guide

> **Language**: [English](SHAREPOINT_SETUP.en.md) | [日本語](SHAREPOINT_SETUP.md)

This document explains the configuration steps for automatically uploading transcripts to SharePoint Online for sales role-play training materials.

## Prerequisites

- Microsoft 365 tenant administrator permissions
- Access to SharePoint Online site
- Azure AD (Microsoft Entra ID) app registration permissions

## 1. Prepare SharePoint Site and Document Library

### 1.1 Create or Select SharePoint Site

1. Access SharePoint Admin Center
2. Use existing site or create new site
3. Note the site URL (e.g., `https://yourtenant.sharepoint.com/sites/SalesTraining`)

### 1.2 Create Document Library

1. In SharePoint site, select "New" → "Document Library"
2. Name: `RolePlayTranscripts` (or any name)
3. Click "Create"

### 1.3 Folder Structure

The system automatically creates folders per store ID (`storeId`).

```
RolePlayTranscripts/
├── store-tokyo-001/
│   ├── transcript_store-tokyo-001_20250122-093000_session-abc123.md
│   └── transcript_store-tokyo-001_20250122-143000_session-def456.md
├── store-osaka-001/
│   └── transcript_store-osaka-001_20250122-100000_session-ghi789.md
└── ...
```

## 2. Azure AD App Registration

### 2.1 Register App

1. Access [Azure Portal](https://portal.azure.com)
2. "Microsoft Entra ID" → "App registrations" → "New registration"
3. Enter the following:
   - Name: `SalesAnalytics-SharePoint-Integration`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: Leave blank
4. Click "Register"

### 2.2 Create Client Secret

1. Select "Certificates & secrets" for the created app
2. Click "New client secret"
3. Description: `SharePoint Access Secret`
4. Expiration: 24 months recommended
5. Click "Add"
6. **Copy and securely save the secret value** (cannot be viewed later)

### 2.3 Note Required Information

Copy the following from the "Overview" page:
- **Application (client) ID**
- **Directory (tenant) ID**
- **Client secret value** (copied in previous step)

## 3. Configure SharePoint Permissions

### 3.1 Add API Permissions

1. Select "API permissions" for the app
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Application permissions"
5. Add the following permissions:
   - `Sites.ReadWrite.All` - Read and write SharePoint sites
   - `Files.ReadWrite.All` - Read and write files
6. Click "Add permissions"
7. **Click "Grant admin consent for [Tenant Name]"** (required)

### 3.2 Grant SharePoint Site Access

#### Option 1: Add as Site Collection Administrator

1. In SharePoint site, "Settings" → "Site permissions"
2. Click "Grant permissions"
3. Enter app client ID: `<ClientId>@<TenantId>`
   - Example: `12345678-1234-1234-1234-123456789abc@87654321-4321-4321-4321-cba987654321`
4. Permission level: `Full Control`
5. Click "Share"

#### Option 2: Grant via PowerShell (Recommended)

```powershell
# Install SharePoint Online Management Shell (first time only)
Install-Module -Name Microsoft.Online.SharePoint.PowerShell

# Connect to SharePoint
Connect-SPOService -Url https://yourtenant-admin.sharepoint.com

# Grant app access
Set-SPOSite -Identity https://yourtenant.sharepoint.com/sites/SalesTraining `
    -DenyAddAndCustomizePages 0

# Or for all sites
Register-SPOAppPrincipal -AppPrincipalId "<ClientId>" `
    -DisplayName "SalesAnalytics SharePoint Integration" `
    -Site https://yourtenant.sharepoint.com/sites/SalesTraining
```

## 4. Azure Functions Configuration

### 4.1 Local Development Environment

Create `local.settings.json` (copy from `local.settings.sample.json`):

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

### 4.2 Azure Functions App Configuration

In Azure Portal, add to Functions App "Configuration" → "Application settings":

| Name | Value |
|------|------|
| `SharePoint:TenantId` | `YOUR_TENANT_ID` |
| `SharePoint:ClientId` | `YOUR_CLIENT_ID` |
| `SharePoint:ClientSecret` | `YOUR_CLIENT_SECRET` |
| `SharePoint:SiteUrl` | `https://yourtenant.sharepoint.com/sites/SalesTraining` |
| `SharePoint:LibraryName` | `RolePlayTranscripts` |

**Recommended**: Use Azure Key Vault to manage secrets:

```json
{
  "SharePoint:ClientSecret": "@Microsoft.KeyVault(SecretUri=https://yourkeyvault.vault.azure.net/secrets/SharePointClientSecret/)"
}
```

## 5. Verify Operation

### 5.1 Manual Testing

1. Start Azure Functions locally:
   ```bash
   cd api/FunctionsApp
   func start
   ```

2. Upload audio file and execute analysis

3. After orchestration completion, verify `sharePointUrl` field in Cosmos DB `sessions` collection

4. Verify file is created in SharePoint site

### 5.2 Troubleshooting

#### Error: "SharePoint site not found"

- Verify `SharePoint:SiteUrl` value is correct
- Site URL format: `https://<tenant>.sharepoint.com/sites/<sitename>`
- No trailing slash required

#### Error: "SharePoint library not found"

- Verify `SharePoint:LibraryName` matches document library name
- Library name is display name (e.g., `Documents`, `RolePlayTranscripts`)

#### Error: "Access Denied"

1. Verify API permissions are correctly configured
2. Verify admin consent is granted
3. Verify SharePoint site access is granted
4. Verify client secret is not expired

#### Check Logs

Verify logs in Application Insights:

```kusto
traces
| where message contains "SharePoint"
| order by timestamp desc
| take 50
```

## 6. Copilot Studio Lite Integration

### 6.1 Add SharePoint Data Source

1. Access [Copilot Studio](https://copilotstudio.microsoft.com/)
2. Create new agent or select existing agent
3. Select "Knowledge" → "Add knowledge"
4. Select "SharePoint"
5. Configure the following:
   - Site URL: `https://yourtenant.sharepoint.com/sites/SalesTraining`
   - Document library: `RolePlayTranscripts`
   - Filter: Configure if targeting specific store folders only

### 6.2 Configure Agent

Add instructions like the following to topics or prompts:

```
You are a role-play agent for sales training.
Reference transcripts stored in SharePoint to generate natural customer responses.

Based on actual conversation examples, be mindful of:
- Effective response patterns learned from successful cases
- Responses to avoid learned from lost cases
- Appropriate reactions based on sentiment analysis results

Provide realistic customer feedback to salesperson utterances.
```

### 6.3 Conduct Role-Play

1. Salesperson accesses Copilot Studio chat interface
2. Agent automatically references SharePoint transcripts
3. Conduct role-play based on actual conversation scenarios
4. Receive real-time feedback from agent

## 7. Security Best Practices

### 7.1 Access Control

- Configure appropriate access permissions for SharePoint folders
- Use SharePoint permissions to set different access rights per store

### 7.2 Data Retention Policy

Configure data retention policy in SharePoint:

1. SharePoint Admin Center → "Policies" → "Retention"
2. Create new retention policy
3. Target: `RolePlayTranscripts` library
4. Retention period: E.g., auto-delete after 1 year

### 7.3 Audit Logs

Enable SharePoint audit logs:

1. SharePoint Admin Center → "Settings" → "Advanced settings"
2. Enable audit log in "Audit" section
3. Log file uploads, downloads, and deletions

### 7.4 Secret Rotation

- Regularly update client secret (recommended: 6 months to 1 year)
- Implement secret version management in Azure Key Vault

## 8. Performance Optimization

### 8.1 Parallel Processing

Current implementation does not fail entire orchestration if SharePoint upload fails:

```csharp
catch (Exception ex)
{
    // Don't fail entire orchestration if SharePoint upload fails (non-critical)
    logger.LogWarning($"Failed to upload to SharePoint (non-critical): {ex.Message}");
}
```

### 8.2 Retry Policy

Microsoft Graph SDK automatically executes retries, but can be customized:

```csharp
var retryHandler = new RetryHandler(new RetryHandlerOption
{
    MaxRetry = 3,
    Delay = 2
});
```

## Summary

With this configuration:

1. ✅ Transcripts automatically uploaded to SharePoint after audio analysis completion
2. ✅ Folders automatically created per store and saved in organized state
3. ✅ Copilot Studio Lite references transcripts for realistic role-play
4. ✅ Data managed securely via secure authentication and authorization

If any issues occur, check Application Insights logs.
