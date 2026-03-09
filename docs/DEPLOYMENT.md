# Deployment Guide

This guide covers deploying the Multi-Agent Student Loan Processing solution to Azure using the Azure Developer CLI (AZD), as well as running the solution locally for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Azure Deployment (AZD)](#azure-deployment-azd)
  - [Quick Deploy](#quick-deploy)
  - [AZD Parameters](#azd-parameters)
  - [What Gets Deployed](#what-gets-deployed)
  - [Post-Deployment](#post-deployment)
- [Local Development](#local-development)
  - [Environment Setup](#environment-setup)
  - [Running the MCP Server](#running-the-mcp-server)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Azure CLI | 2.80.0+ | [Install](https://docs.microsoft.com/cli/azure/install-azure-cli) |
| Azure Developer CLI (azd) | 1.18.0+ | [Install](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) |
| Docker Desktop | Latest | [Install](https://www.docker.com/products/docker-desktop) |
| Python | 3.11+ | [Install](https://www.python.org/downloads/) |
| Node.js | 18+ | [Install](https://nodejs.org/) |

**Azure subscription requirements:**

- **Contributor** role at the subscription level
- **User Access Administrator** (or **Role Based Access Control Administrator**) role for RBAC assignments
- Azure AI Services access ([request here](https://aka.ms/oai/access))

**Supported regions:** `eastus`, `eastus2`, `westus`, `westus2`, `swedencentral`, `northcentralus`

---

## Azure Deployment (AZD)

### Quick Deploy

```bash
# 1. Log in to Azure
azd auth login

# 2. Initialize the environment (first time only)
azd init

# 3. Deploy everything
azd up
```

AZD will prompt for parameter values on first run (solution prefix, region, WAF toggles). Subsequent runs reuse saved values.

The deployment runs in two phases automatically:
1. **Provision infrastructure** — creates ACR, AI Services, Storage, App Service, etc.
2. **Post-provision hook** — builds Docker images via `az acr build`, pushes to ACR, then re-provisions to deploy container instances.

**Deployment time:** ~20-30 minutes (includes building 3 container images)

### AZD Parameters

These parameters are configured during `azd init` or `azd up` and stored in `.azure/<env-name>/.env`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `solutionPrefix` | `loanproc` | Unique prefix for all resource names (3-15 chars) |
| `azureAiServiceLocation` | `eastus` | Region for Azure AI Foundry / model deployments |
| `enableMonitoring` | `false` | Enable Log Analytics and Application Insights |
| `enableScalability` | `false` | Enable auto-scaling and higher SKUs |
| `enableRedundancy` | `false` | Enable zone redundancy and geo-replication |
| `enablePrivateNetworking` | `false` | Enable VNet integration and private endpoints |

> **Tip:** Enable `enableMonitoring` for production workloads to get Application Insights telemetry and Log Analytics diagnostics.

### What Gets Deployed

| Resource | Purpose |
|----------|---------|| Azure Container Registry | Container image build and storage || Azure AI Services + AI Foundry Project | GPT-4o model hosting and agent orchestration |
| Azure Container Instance (backend) | Backend API server (port 8000) |
| Azure Container Instance (MCP) | Loan approval MCP server (port 8080) |
| Azure App Service | Frontend web application (Docker, nginx) |
| Azure Blob Storage | Document storage for uploaded loan files |
| User-Assigned Managed Identity | Secure authentication across services |
| Log Analytics + App Insights | Monitoring and diagnostics (when `enableMonitoring` is enabled) |
| Virtual Network | Network isolation (when `enablePrivateNetworking` is enabled) |

### Post-Deployment

After `azd up` completes, the post-provision hook displays:

```
===== Provision Complete =====

Web App URL: https://<prefix>-frontend-web.azurewebsites.net
Storage Account: <prefix>storage
AI Foundry Project: <prefix>-ai-project
Backend Container Instance: <prefix>-aci-backend
MCP Container Instance: <prefix>-aci-mcp

===== Deployment Complete =====
```

Open the **Web App URL** in your browser to start using the application.

#### Upload Sample Data

Upload the sample loan documents from `src/backend/upload_data/` to the provisioned blob storage container (`content`):

```bash
az storage blob upload-batch \
  --account-name <storage-account-name> \
  --destination content \
  --source src/backend/upload_data/ \
  --auth-mode login
```

#### Tear Down

To remove all deployed resources:

```bash
azd down --purge
```

---

## Local Development

### Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.sample .env
   ```

2. Fill in the required values in `.env`:

   ```bash
   # Required: Azure AI Foundry endpoint from your deployed project
   AZURE_AI_PROJECT_ENDPOINT=https://<your-foundry-endpoint>.cognitiveservices.azure.com/

   # Required: Azure Blob Storage account name
   AZURE_STORAGE_ACCOUNT=<your-storage-account>

   # Local MCP server URL (default port for dev profile)
   LOAN_APPROVAL_MCP_URL=http://localhost:8070/mcp

   # Set dev profile
   PROFILE=dev
   USE_FOUNDRY=true
   ```

3. Authenticate with Azure (for managed identity / DefaultAzureCredential):

   ```bash
   az login
   ```

### Running the MCP Server

The MCP loan approval server must be running before the backend can process loan decisions.

```bash
cd src/biz_api/loan_approval

# Install dependencies
pip install -e .

# Set dev profile so it uses port 8070
export PROFILE=dev

# Start the server
python main.py
```

The MCP server will start on **http://localhost:8070**.

### Running the Backend

```bash
cd src/backend

# Install dependencies
pip install -e ".[dev]"

# Load environment variables
export $(grep -v '^#' ../../.env | xargs)

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at **http://localhost:8000**.

- Health check: `GET http://localhost:8000/health`
- Chat API: `POST http://localhost:8000/api/chat`

### Running the Frontend

```bash
cd src/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend dev server starts on **http://localhost:5173** (Vite default) with hot module replacement.

> **Note:** The frontend expects the backend API at `http://localhost:8000`. If your backend runs on a different port, update the API base URL in `src/frontend/src/services/api.ts`.

### Running with Docker (Optional)

Build and run each service individually:

```bash
# Backend
docker build -t loan-backend -f src/backend/Dockerfile src/backend
docker run -p 8000:8000 --env-file .env loan-backend

# MCP Server
docker build -t loan-mcp -f src/biz_api/loan_approval/Dockerfile src/biz_api/loan_approval
docker run -p 8070:8080 -e PROFILE=dev loan-mcp

# Frontend
docker build -t loan-frontend -f src/frontend/Dockerfile src/frontend
docker run -p 3000:80 loan-frontend
```

---

## Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AZURE_AI_PROJECT_ENDPOINT` | Yes (Foundry mode) | — | Azure AI Foundry project endpoint |
| `AZURE_AI_MODEL_DEPLOYMENT_NAME` | No | `gpt-4o` | Model deployment name in AI Foundry |
| `USE_FOUNDRY` | No | `true` | Use AI Foundry routing (`true`) or direct Azure OpenAI (`false`) |
| `AZURE_OPENAI_ENDPOINT` | Yes (non-Foundry) | — | Direct Azure OpenAI endpoint |
| `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` | No | `gpt-4o` | Chat model deployment name |
| `AZURE_OPENAI_API_KEY` | No | — | API key (if not using managed identity) |
| `AZURE_STORAGE_ACCOUNT` | Yes | — | Storage account name for document uploads |
| `AZURE_STORAGE_CONTAINER` | No | `content` | Blob container name |
| `LOAN_APPROVAL_MCP_URL` | Yes | `http://localhost:8070/mcp` | MCP loan approval server URL |
| `AZURE_CLIENT_ID` | No | — | Managed identity client ID |
| `PROFILE` | No | `prod` | `dev` for local development, `prod` for deployed |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | No | — | App Insights connection string |
| `ENABLE_OTEL` | No | `false` | Enable OpenTelemetry export |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `azd up` fails with quota error | Try a different region or request quota increase for Azure AI Services |
| `azd up` fails with InaccessibleImage | This is expected on first run; the post-provision hook builds images and re-provisions automatically |
| Container image pull fails | Ensure ACR exists and images were built (check `az acr repository list -n <acr-name>`) |
| Backend returns 401/403 | Verify managed identity has **Cognitive Services OpenAI User** role on the AI Services resource |
| MCP connection refused | Ensure the MCP server is running and `LOAN_APPROVAL_MCP_URL` is correct |
| Frontend shows blank page | Check browser console; verify backend URL in `api.ts` matches your running backend |
| `azd auth login` fails | Run `az login` first, then retry `azd auth login` |
| Storage upload fails | Ensure your identity has **Storage Blob Data Contributor** role on the storage account |
