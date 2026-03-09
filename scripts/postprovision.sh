#!/bin/bash
set -e

echo "===== Post-Provision: Building Container Images ====="

# Load azd environment values
eval "$(azd env get-values 2>/dev/null | sed 's/^/export /')"

DEPLOY_CONTAINERS="${DEPLOY_CONTAINERS:-false}"
ACR_NAME="${ACR_NAME:-}"
RESOURCE_GROUP="${RESOURCE_GROUP_NAME:-}"

if [ -z "$ACR_NAME" ]; then
  echo "ERROR: ACR_NAME not set. Provision may have failed."
  exit 1
fi

echo "ACR: $ACR_NAME"
echo "Resource Group: $RESOURCE_GROUP"

# Build and push images to ACR using az acr build (no local Docker required)
echo ""
echo "Building backend image..."
az acr build \
  --registry "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --image "loan-processing-backend:${IMAGE_TAG:-latest}" \
  ./src/backend

echo ""
echo "Building MCP server image..."
az acr build \
  --registry "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --image "loan-processing-mcp:${IMAGE_TAG:-latest}" \
  ./src/biz_api/loan_approval

echo ""
echo "Building frontend image..."
az acr build \
  --registry "$ACR_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --image "loan-processing-frontend:${IMAGE_TAG:-latest}" \
  ./src/frontend

echo ""
echo "===== Images Built and Pushed ====="

# Deploy container instances if not yet deployed
if [ "$DEPLOY_CONTAINERS" != "true" ]; then
  echo ""
  echo "===== Deploying Container Instances ====="
  azd env set DEPLOY_CONTAINERS true
  azd provision --no-prompt
  echo "===== Container Instances Deployed ====="
else
  echo ""
  echo "===== Restarting Container Instances ====="
  az container restart \
    --name "$CONTAINER_INSTANCE_BACKEND_NAME" \
    --resource-group "$RESOURCE_GROUP" 2>/dev/null || echo "Backend ACI restart skipped"
  az container restart \
    --name "$CONTAINER_INSTANCE_MCP_NAME" \
    --resource-group "$RESOURCE_GROUP" 2>/dev/null || echo "MCP ACI restart skipped"
  echo "===== Container Instances Restarted ====="
fi

echo ""
echo "===== Post-Provision Complete ====="
