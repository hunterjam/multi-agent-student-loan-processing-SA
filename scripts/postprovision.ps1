$ErrorActionPreference = "Stop"

Write-Host "===== Post-Provision: Building Container Images =====" -ForegroundColor Green

# Load azd environment values
$envValues = azd env get-values 2>$null
foreach ($line in $envValues) {
    if ($line -match '^([^=]+)="?([^"]*)"?$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

$DEPLOY_CONTAINERS = $env:DEPLOY_CONTAINERS
if ([string]::IsNullOrEmpty($DEPLOY_CONTAINERS)) { $DEPLOY_CONTAINERS = "false" }
$ACR_NAME = $env:ACR_NAME
$RESOURCE_GROUP = $env:RESOURCE_GROUP_NAME
$IMAGE_TAG = $env:IMAGE_TAG
if ([string]::IsNullOrEmpty($IMAGE_TAG)) { $IMAGE_TAG = "latest" }

if ([string]::IsNullOrEmpty($ACR_NAME)) {
    Write-Host "ERROR: ACR_NAME not set. Provision may have failed." -ForegroundColor Red
    exit 1
}

Write-Host "ACR: $ACR_NAME"
Write-Host "Resource Group: $RESOURCE_GROUP"

# Build and push images to ACR
Write-Host ""
Write-Host "Building backend image..." -ForegroundColor Cyan
az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image "loan-processing-backend:$IMAGE_TAG" `
    ./src/backend

Write-Host ""
Write-Host "Building MCP server image..." -ForegroundColor Cyan
az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image "loan-processing-mcp:$IMAGE_TAG" `
    ./src/biz_api/loan_approval

Write-Host ""
Write-Host "Building frontend image..." -ForegroundColor Cyan
az acr build `
    --registry $ACR_NAME `
    --resource-group $RESOURCE_GROUP `
    --image "loan-processing-frontend:$IMAGE_TAG" `
    ./src/frontend

Write-Host ""
Write-Host "===== Images Built and Pushed =====" -ForegroundColor Green

# Deploy container instances if not yet deployed
if ($DEPLOY_CONTAINERS -ne "true") {
    Write-Host ""
    Write-Host "===== Deploying Container Instances =====" -ForegroundColor Green
    azd env set DEPLOY_CONTAINERS true
    azd provision --no-prompt
    Write-Host "===== Container Instances Deployed =====" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "===== Restarting Container Instances =====" -ForegroundColor Green
    try {
        az container restart `
            --name $env:CONTAINER_INSTANCE_BACKEND_NAME `
            --resource-group $RESOURCE_GROUP
    } catch {
        Write-Host "Backend ACI restart skipped" -ForegroundColor Yellow
    }
    try {
        az container restart `
            --name $env:CONTAINER_INSTANCE_MCP_NAME `
            --resource-group $RESOURCE_GROUP
    } catch {
        Write-Host "MCP ACI restart skipped" -ForegroundColor Yellow
    }
    Write-Host "===== Container Instances Restarted =====" -ForegroundColor Green
}

Write-Host ""
Write-Host "===== Post-Provision Complete =====" -ForegroundColor Green
