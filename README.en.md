# Sales Analytics - MVP

> **Language**: [English](README.en.md) | [日本語](README.md)

Auto-Transcription and Analysis System for Automobile Dealer Sales Conversations (MVP)

## Overview

Upload sales conversation audio (face-to-face recordings in Japanese) for automatic processing:
- Transcription (with speaker diarization)
- PII (Personally Identifiable Information) masking
- Sentiment analysis
- LLM summarization (structured JSON)
- RAG-based similar conversation search
- Outcome (won/lost/pending/canceled) two-stage approval workflow
- KPI dashboard (conversion rate, etc.)
- **SharePoint Online integration (automatic generation of sales role-play training materials)**

## Tech Stack

**Frontend**
- Next.js 16.0.10 (App Router)
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS v4.1.10
- Base UI (@base-ui/react) 1.0.0
- pnpm 10.26.0
- Zod 3.24.1 (validation)
- date-fns 4.1.0 (date handling)
- recharts 2.15.0 (charts)
- Design: Clean white/black theme
- Icons: PNG images in /frontend/public/assets/logo (case.png, KPI.png, Voice.png, Approval.png)
- Favicon: Top.png

**Backend**
- Azure Functions v4 (.NET 8 Isolated)
  - Azure Functions Worker: 1.24.0
  - Worker SDK: 1.18.1
  - Durable Task Extensions: 1.1.5
- Azure AI Services
  - Azure AI Speech (transcription + speaker diarization)
  - Azure AI Language (PII detection, sentiment analysis) v5.3.0
  - Azure OpenAI (GPT-4o summarization) v2.1.0
- Azure Data & Storage
  - Azure AI Search (vector search) v11.7.0
  - Azure Cosmos DB (NoSQL) v3.45.0
  - Azure Blob Storage (temporary audio file storage) v12.23.0
  - Azure Key Vault (secrets management) v4.8.0
- SharePoint Integration
  - Microsoft Graph v5.86.0 (SharePoint Online API)
- Validation & Utilities
  - FluentValidation v11.11.0

## Setup

### Prerequisites
- Node.js 20.x or later
- .NET 8 SDK (8.0.404 or later recommended)
- Azure Functions Core Tools 4.6.0 or later
- Azure CLI
- corepack enabled (`corepack enable`)
- Azurite (local development storage emulator)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/POC-SalesAnalytics.git
cd POC-SalesAnalytics
```

### 2. Frontend
```bash
cd frontend
corepack enable
pnpm install
cp .env.example .env.local
# Configure required environment variables in .env.local (see docs/ENV.en.md)
pnpm dev
```

Open browser at `http://localhost:3000`.

### 3. Backend
```bash
cd api/FunctionsApp
cp local.settings.sample.json local.settings.json
# Configure connection strings in local.settings.json (see docs/ENV.en.md)
dotnet restore
dotnet build
func start
```

Functions start at `http://localhost:7071`.

**Note (Windows ARM64 Environment)**

On Windows ARM64, Azure Functions Core Tools 4.6.0 may display the following error message:

```
Could not load file or assembly 'Microsoft.Azure.Functions.Platform.Metrics.LinuxConsumption'
```

This error message appears but Functions will work normally. You can address this in one of the following ways:

1. **Run from VS Code Task** (recommended)
   - In VS Code: `Ctrl+Shift+P` → `Tasks: Run Task` → `build (functions)`
   - Functions will start automatically

2. **Run directly from build output directory**
   ```bash
   cd api/FunctionsApp
   dotnet build
   cd bin/Debug/net8.0
   func host start
   ```

3. **Run in Docker container**
   ```bash
   docker build -t salesanalytics-api .
   docker run -p 7071:80 salesanalytics-api
   ```

### 4. Deploy Azure Resources (Dev Environment)
```bash
cd infra
az login
az deployment sub create \
  --location japaneast \
  --template-file main.bicep \
  --parameters params.dev.json
```

## Directory Structure

```
POC-SalesAnalytics/
├── frontend/          # Next.js App Router
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── package.json   # pnpm locked
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
│   ├── ARCHITECTURE.en.md
│   └── ENV.en.md
└── .github/workflows/ # CI/CD
```

## Key Features

### 1. Consent (Required)
Consent checkbox is mandatory in the UI before audio upload. Upload is blocked without consent.

### 2. Transcription + Speaker Diarization
Azure AI Speech (Diarization) automatically identifies speakers.

### 3. PII Masking
Azure AI Language detects PII and masks it before indexing.

### 4. Sentiment Analysis
Determines sentiment (positive/neutral/negative) for transcribed text.

### 5. LLM Summarization
Azure OpenAI (GPT-4o) generates structured JSON output:
- Key points (keyPoints)
- Customer concerns (concerns)
- Next actions (nextActions)
- Success factors (successFactors)
- Improvement areas (improvementAreas)
- Quotations (quotations: speakerSegmentId + timeRange)

### 6. Outcome Two-Stage Approval Workflow
- **Sales**: Request outcome (won/lost/pending/canceled) for their conversations
- **Manager**: Can approve only for the same store (storeId)
- **Deadline**: Must be confirmed within 7 days after conversation. After deadline, only Manager can approve with a required reason (logged as OVERRIDE in audit log)
- **Audit Log (label_audit)**: Append-only (no updates/deletes)

### 7. KPI Dashboard
- Conversion rate = won / (won + lost)
- Aggregated by store, salesperson, and time period
- Sample counts displayed

### 8. RAG Similar Conversation Search
Vector indexing/search with Azure AI Search (minimal implementation).

### 9. SharePoint Online Integration (Sales Role-Play Training Materials)
After audio analysis completion, transcripts in Markdown format are automatically uploaded to SharePoint Online:
- **Markdown Content**: Basic information, conversation transcript, sentiment analysis, AI summary, outcome results, role-play guide
- **Automatic Folder Creation**: Folders automatically created per store ID (storeId)
- **Secure Authentication**: Client authentication via Azure AD (Microsoft Entra ID) app registration
- **Copilot Studio Lite Integration**: Real sales role-play with AI agents referencing transcripts stored in SharePoint

For detailed setup instructions, see [docs/SHAREPOINT_SETUP.en.md](docs/SHAREPOINT_SETUP.en.md).

## Out of Scope for MVP (TODO)
The following are marked as TODO comments for future expansion:
- Repeat (90-day) workflow and notifications
- Playbook version management
- Retention extension UI (up to 1 year)
- Advanced Blob Lifecycle policy configuration

## Known Issues and Limitations

### Windows ARM64 Environment
- Azure Functions Core Tools 4.6.0 may display the following error message, but it does not affect operation:
  ```
  Could not load file or assembly 'Microsoft.Azure.Functions.Platform.Metrics.LinuxConsumption'
  ```
- Recommended: Run from VS Code task or directly from build output directory

### Package Version Compatibility
- Azure Functions Worker SDK v2.0.0 has compatibility issues with Core Tools 4.6.0, so v1.18.1 is used
- Azure.AI.OpenAI v2.1.0 requires using the `OpenAI.Chat` namespace
- Azure.Search.Documents v11.8.0 is not available at this time, so v11.7.0 is used

## Security & Compliance

- **Secrets Management**: Key Vault + Managed Identity (no secrets in code)
- **RBAC**:
  - Sales: Read/write own sessions only
  - Manager: Approve own store sessions only
  - Auditor: Read-only access to all sessions
- **Audit Log**: Append-only (no updates/deletes)
- **Input Validation**:
  - .NET: FluentValidation v11.11.0
  - TypeScript: Zod v3.24.1
- **SharePoint Integration**: See [SHAREPOINT_SETUP.en.md](docs/SHAREPOINT_SETUP.en.md)
- **Errors**: Returned with traceId
- **LLM**: JSON Schema enforcement + prompt injection protection
- **PII Protection**: Detected and masked with Azure AI Language v5.3.0 before indexing

## Development Environment Setup

For details, see the following documents:
- [ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md) - Detailed system architecture
- [ENV.en.md](docs/ENV.en.md) - Environment variables and troubleshooting

## License

MIT

## Contributing

Issues and PRs are welcome.

## Support

For details, see [docs/ARCHITECTURE.en.md](docs/ARCHITECTURE.en.md) and [docs/ENV.en.md](docs/ENV.en.md).
