# Local Development

## Prerequisites

- Python 3.11+
- Node.js 18+
- Azure CLI (`az login` authenticated)
- Access to the deployed Azure resources (AI Services, Storage Account)

## Setup

### 1. Create a Python virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
# Backend
pip install -e ./src/backend

# MCP Server
pip install -e ./src/biz_api/loan_approval

# Frontend
cd src/frontend && npm install
```

### 3. Configure environment

Copy and customize the backend env file:

```bash
cp .env.sample src/backend/.env.dev
```

Edit `src/backend/.env.dev` with your Azure resource values. Key settings:

| Variable | Description |
|----------|-------------|
| `PROFILE` | Must be `dev` for local development |
| `AZURE_AI_PROJECT_ENDPOINT` | Your AI Foundry project endpoint |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint |
| `AZURE_STORAGE_ACCOUNT` | Your storage account name |
| `LOAN_APPROVAL_MCP_URL` | `http://localhost:8070/mcp` |

When `PROFILE=dev`, the backend uses `AzureCliCredential` (your `az login` session) instead of managed identity.

### 4. Grant Azure RBAC roles

Your Azure CLI identity needs data-plane access to the storage account. Assign **Storage Blob Data Contributor**:

```bash
USER_OID=$(az ad signed-in-user show --query id -o tsv)

az role assignment create \
  --assignee "$USER_OID" \
  --role "Storage Blob Data Contributor" \
  --scope "/subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP>/providers/Microsoft.Storage/storageAccounts/<STORAGE_ACCOUNT>"
```

Replace `<SUBSCRIPTION_ID>`, `<RESOURCE_GROUP>`, and `<STORAGE_ACCOUNT>` with your values.

> **Note:** RBAC propagation can take up to a minute after assignment.

## Running Locally

Start each service in a separate terminal:

### Terminal 1 — MCP Server (port 8070)

```bash
cd src/biz_api/loan_approval
PROFILE=dev python main.py
```

### Terminal 2 — Backend (port 8000)

```bash
cd src/backend
PROFILE=dev uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 3 — Frontend (port 3000)

```bash
cd src/frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

## Architecture (Local)

```
Browser → localhost:3000 (Vite) → /api proxy → localhost:8000 (FastAPI)
                                                      ↓
                                               localhost:8070 (MCP Server)
                                                      ↓
                                               Azure AI Services
                                               Azure Blob Storage
```

The Vite dev server proxies all `/api` requests to the FastAPI backend, matching the production nginx reverse-proxy behavior.
