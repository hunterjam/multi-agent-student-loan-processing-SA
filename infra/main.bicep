// ========== main.bicep ========== //
targetScope = 'resourceGroup'

metadata name = 'Student Loan Processing Solution Accelerator'
metadata description = '''
Multi-agent student loan processing solution using Microsoft Agent Framework
with Azure Foundry for AI orchestration.
'''

// ============== //
// Parameters     //
// ============== //

@minLength(3)
@maxLength(15)
@description('Optional. A unique application/solution name for all resources in this deployment.')
param solutionName string = 'loanproc'

@maxLength(5)
@description('Optional. A unique text value for the solution.')
param solutionUniqueText string = substring(uniqueString(subscription().id, resourceGroup().name, solutionName), 0, 5)

@allowed([
  'australiaeast'
  'centralus'
  'eastasia'
  'eastus'
  'eastus2'
  'japaneast'
  'northeurope'
  'southeastasia'
  'swedencentral'
  'uksouth'
  'westus'
  'westus3'
])
@metadata({ azd: { type: 'location' } })
@description('Required. Azure region for all services.')
param location string

@minLength(3)
@description('Optional. Secondary location for database creation.')
param secondaryLocation string = 'uksouth'

@allowed([
  'australiaeast'
  'canadaeast'
  'eastus2'
  'japaneast'
  'koreacentral'
  'polandcentral'
  'swedencentral'
  'switzerlandnorth'
  'uaenorth'
  'uksouth'
  'westus3'
])
@metadata({
  azd: {
    type: 'location'
    usageName: [
      'OpenAI.GlobalStandard.gpt-4o,150'
    ]
  }
})
@description('Required. Location for AI deployments.')
param azureAiServiceLocation string

@minLength(1)
@allowed([
  'Standard'
  'GlobalStandard'
])
@description('Optional. GPT model deployment type.')
param gptModelDeploymentType string = 'GlobalStandard'

@minLength(1)
@description('Optional. Name of the GPT model to deploy.')
param gptModelName string = 'gpt-4o'

@description('Optional. Version of the GPT model to deploy.')
param gptModelVersion string = '2024-11-20'

@description('Optional. API version for Azure OpenAI service.')
param azureOpenaiAPIVersion string = '2025-01-01-preview'

@description('Optional. API version for Azure AI Agent service.')
param azureAiAgentApiVersion string = '2025-05-01'

@minValue(10)
@description('Optional. AI model deployment token capacity.')
param gptModelCapacity int = 150

@description('Optional. Existing Log Analytics Workspace Resource ID.')
param existingLogAnalyticsWorkspaceId string = ''

@description('Optional. Resource ID of an existing Foundry project.')
param azureExistingAIProjectResourceId string = ''

@description('Optional. Deploy Azure Bastion and Jumpbox VM for private network administration.')
param deployBastionAndJumpbox bool = false

@description('Optional. The tags to apply to all deployed Azure resources.')
param tags object = {}

@description('Optional. Enable monitoring for applicable resources (WAF-aligned).')
param enableMonitoring bool = false

@description('Optional. Enable scalability for applicable resources (WAF-aligned).')
param enableScalability bool = false

@description('Optional. Enable redundancy for applicable resources (WAF-aligned).')
param enableRedundancy bool = false

@description('Optional. Enable private networking for applicable resources (WAF-aligned).')
param enablePrivateNetworking bool = false

@description('Optional. Image tag for container images. Updated by post-provision script.')
param imageTag string = 'latest'

@description('Whether to deploy container instances. Auto-set after building images.')
param deployContainers bool = false

@description('Optional. Enable/Disable usage telemetry.')
param enableTelemetry bool = true

@description('Optional. Created by user name.')
param createdBy string = contains(deployer(), 'userPrincipalName')
  ? split(deployer().userPrincipalName, '@')[0]
  : deployer().objectId

// ============== //
// Variables      //
// ============== //

var solutionLocation = empty(location) ? resourceGroup().location : location
#disable-next-line no-unused-vars
var acrResourceName = toLower('acr${solutionSuffix}')

var solutionSuffix = toLower(trim(replace(
  replace(
    replace(replace(replace(replace('${solutionName}${solutionUniqueText}', '-', ''), '_', ''), '.', ''), '/', ''),
    ' ',
    ''
  ),
  '*',
  ''
)))

var replicaRegionPairs = {
  australiaeast: 'australiasoutheast'
  centralus: 'westus'
  eastasia: 'japaneast'
  eastus: 'centralus'
  eastus2: 'centralus'
  japaneast: 'eastasia'
  northeurope: 'westeurope'
  southeastasia: 'eastasia'
  uksouth: 'westeurope'
  westus: 'westus3'
  westus3: 'westus'
}
var replicaLocation = replicaRegionPairs[?resourceGroup().location] ?? secondaryLocation

var useExistingLogAnalytics = !empty(existingLogAnalyticsWorkspaceId)
var useExistingAiFoundryAiProject = !empty(azureExistingAIProjectResourceId)

var aiFoundryAiServicesResourceGroupName = useExistingAiFoundryAiProject
  ? split(azureExistingAIProjectResourceId, '/')[4]
  : 'rg-${solutionSuffix}'
var aiFoundryAiServicesSubscriptionId = useExistingAiFoundryAiProject
  ? split(azureExistingAIProjectResourceId, '/')[2]
  : subscription().subscriptionId
var aiFoundryAiServicesResourceName = useExistingAiFoundryAiProject
  ? split(azureExistingAIProjectResourceId, '/')[8]
  : 'aif-${solutionSuffix}'
var aiFoundryAiProjectResourceName = useExistingAiFoundryAiProject
  ? split(azureExistingAIProjectResourceId, '/')[10]
  : 'proj-${solutionSuffix}'

// Model deployments for Foundry AI Services
var aiFoundryAiServicesModelDeployment = [
  {
    format: 'OpenAI'
    name: gptModelName
    model: gptModelName
    sku: {
      name: gptModelDeploymentType
      capacity: gptModelCapacity
    }
    version: gptModelVersion
    raiPolicyName: 'Microsoft.Default'
  }
]

var aiFoundryAiProjectDescription = 'Student Loan Processing AI Foundry Project'
var existingTags = resourceGroup().tags ?? {}

// ============== //
// Resources      //
// ============== //

#disable-next-line no-deployments-resources
resource avmTelemetry 'Microsoft.Resources/deployments@2024-03-01' = if (enableTelemetry) {
  name: '46d3xbcp.ptn.sa-loanproc.${replace('-..--..-', '.', '-')}.${substring(uniqueString(deployment().name, solutionLocation), 0, 4)}'
  properties: {
    mode: 'Incremental'
    template: {
      '$schema': 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#'
      contentVersion: '1.0.0.0'
      resources: []
      outputs: {
        telemetry: {
          type: 'String'
          value: 'For more information, see https://aka.ms/avm/TelemetryInfo'
        }
      }
    }
  }
}

// ========== Resource Group Tag ========== //
resource resourceGroupTags 'Microsoft.Resources/tags@2021-04-01' = {
  name: 'default'
  properties: {
    tags: union(
      existingTags,
      tags,
      {
        TemplateName: 'StudentLoanProcessing'
        Type: enablePrivateNetworking ? 'WAF' : 'Non-WAF'
        CreatedBy: createdBy
      }
    )
  }
}

// ========== Log Analytics Workspace ========== //
var logAnalyticsWorkspaceResourceName = 'log-${solutionSuffix}'
module logAnalyticsWorkspace 'br/public:avm/res/operational-insights/workspace:0.14.2' = if (enableMonitoring && !useExistingLogAnalytics) {
  name: take('avm.res.operational-insights.workspace.${logAnalyticsWorkspaceResourceName}', 64)
  params: {
    name: logAnalyticsWorkspaceResourceName
    tags: tags
    location: solutionLocation
    enableTelemetry: enableTelemetry
    skuName: 'PerGB2018'
    dataRetention: 365
    features: { enableLogAccessUsingOnlyResourcePermissions: true }
    diagnosticSettings: [{ useThisWorkspace: true }]
    dailyQuotaGb: enableRedundancy ? 10 : null
    replication: enableRedundancy
      ? {
          enabled: true
          location: replicaLocation
        }
      : null
    publicNetworkAccessForIngestion: enablePrivateNetworking ? 'Disabled' : 'Enabled'
    publicNetworkAccessForQuery: enablePrivateNetworking ? 'Disabled' : 'Enabled'
  }
}
var logAnalyticsWorkspaceResourceId = useExistingLogAnalytics
  ? existingLogAnalyticsWorkspaceId
  : (enableMonitoring ? logAnalyticsWorkspace!.outputs.resourceId : '')

// ========== Application Insights ========== //
var applicationInsightsResourceName = 'appi-${solutionSuffix}'
module applicationInsights 'br/public:avm/res/insights/component:0.7.1' = if (enableMonitoring) {
  name: take('avm.res.insights.component.${applicationInsightsResourceName}', 64)
  params: {
    name: applicationInsightsResourceName
    tags: tags
    location: solutionLocation
    enableTelemetry: enableTelemetry
    retentionInDays: 365
    kind: 'web'
    disableIpMasking: false
    flowType: 'Bluefield'
    workspaceResourceId: logAnalyticsWorkspaceResourceId
    diagnosticSettings: [{ workspaceResourceId: logAnalyticsWorkspaceResourceId }]
  }
}

// ========== User Assigned Identity ========== //
var userAssignedIdentityResourceName = 'id-${solutionSuffix}'
module userAssignedIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.3' = {
  name: take('avm.res.managed-identity.user-assigned-identity.${userAssignedIdentityResourceName}', 64)
  params: {
    name: userAssignedIdentityResourceName
    location: solutionLocation
    tags: tags
    enableTelemetry: enableTelemetry
  }
}

// ========== Virtual Network and Networking Components ========== //
module virtualNetwork 'modules/virtualNetwork.bicep' = if (enablePrivateNetworking) {
  name: take('module.virtualNetwork.${solutionSuffix}', 64)
  params: {
    vnetName: 'vnet-${solutionSuffix}'
    vnetLocation: solutionLocation
    vnetAddressPrefixes: ['10.0.0.0/20']
    tags: tags
    logAnalyticsWorkspaceId: logAnalyticsWorkspaceResourceId
    enableTelemetry: enableTelemetry
    resourceSuffix: solutionSuffix
    deployBastionAndJumpbox: deployBastionAndJumpbox
  }
  dependsOn: enableMonitoring ? [logAnalyticsWorkspace] : []
}

// ========== Private DNS Zones ========== //
var privateDnsZones = [
  'privatelink.cognitiveservices.azure.com'
  'privatelink.openai.azure.com'
  'privatelink.blob.${environment().suffixes.storage}'
]

var dnsZoneIndex = {
  cognitiveServices: 0
  openAI: 1
  storageBlob: 2
}

@batchSize(5)
module avmPrivateDnsZones 'br/public:avm/res/network/private-dns-zone:0.8.0' = [
  for (zone, i) in privateDnsZones: if (enablePrivateNetworking) {
    name: take('avm.res.network.private-dns-zone.${replace(zone, '.', '-')}', 64)
    params: {
      name: zone
      tags: tags
      enableTelemetry: enableTelemetry
      virtualNetworkLinks: [
        {
          virtualNetworkResourceId: enablePrivateNetworking ? virtualNetwork!.outputs.resourceId : ''
          registrationEnabled: false
        }
      ]
    }
  }
]

// ========== AI Foundry: AI Services ========== //
module aiFoundryAiServices 'br/public:avm/res/cognitive-services/account:0.14.0' = if (!useExistingAiFoundryAiProject) {
  name: take('avm.res.cognitive-services.account.${aiFoundryAiServicesResourceName}', 64)
  params: {
    name: aiFoundryAiServicesResourceName
    location: azureAiServiceLocation
    tags: tags
    sku: 'S0'
    kind: 'AIServices'
    disableLocalAuth: true
    allowProjectManagement: true
    customSubDomainName: aiFoundryAiServicesResourceName
    restrictOutboundNetworkAccess: false
    deployments: [
      for deployment in aiFoundryAiServicesModelDeployment: {
        name: deployment.name
        model: {
          format: deployment.format
          name: deployment.name
          version: deployment.version
        }
        raiPolicyName: deployment.raiPolicyName
        sku: {
          name: deployment.sku.name
          capacity: deployment.sku.capacity
        }
      }
    ]
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    managedIdentities: {
      userAssignedResourceIds: [userAssignedIdentity!.outputs.resourceId]
    }
    roleAssignments: [
      {
        roleDefinitionIdOrName: '53ca6127-db72-4b80-b1b0-d745d6d5456d' // Azure AI User
        principalId: userAssignedIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
      }
      {
        roleDefinitionIdOrName: '64702f94-c441-49e6-a78b-ef80e0188fee' // Azure AI Developer
        principalId: userAssignedIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
      }
      {
        roleDefinitionIdOrName: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd' // Cognitive Services OpenAI User
        principalId: userAssignedIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
      }
      {
        roleDefinitionIdOrName: '53ca6127-db72-4b80-b1b0-d745d6d5456d' // Azure AI User for deployer
        principalId: deployer().objectId
      }
    ]
    diagnosticSettings: enableMonitoring ? [{ workspaceResourceId: logAnalyticsWorkspaceResourceId }] : null
    publicNetworkAccess: enablePrivateNetworking ? 'Disabled' : 'Enabled'
  }
}

// Private endpoint for AI Services
module aiServicesPrivateEndpoint 'br/public:avm/res/network/private-endpoint:0.11.0' = if (!useExistingAiFoundryAiProject && enablePrivateNetworking) {
  name: take('pep-ai-services-${aiFoundryAiServicesResourceName}', 64)
  params: {
    name: 'pep-${aiFoundryAiServicesResourceName}'
    location: solutionLocation
    tags: tags
    subnetResourceId: virtualNetwork!.outputs.pepsSubnetResourceId
    privateLinkServiceConnections: [
      {
        name: 'pep-${aiFoundryAiServicesResourceName}'
        properties: {
          privateLinkServiceId: aiFoundryAiServices!.outputs.resourceId
          groupIds: ['account']
        }
      }
    ]
    privateDnsZoneGroup: {
      privateDnsZoneGroupConfigs: [
        {
          name: 'cognitiveservices'
          privateDnsZoneResourceId: avmPrivateDnsZones[dnsZoneIndex.cognitiveServices]!.outputs.resourceId
        }
        {
          name: 'openai'
          privateDnsZoneResourceId: avmPrivateDnsZones[dnsZoneIndex.openAI]!.outputs.resourceId
        }
      ]
    }
  }
}

// ========== AI Foundry Project ========== //
module aiFoundryAiServicesProject 'modules/ai-project.bicep' = if (!useExistingAiFoundryAiProject) {
  name: take('module.ai-project.${aiFoundryAiProjectResourceName}', 64)
  params: {
    name: aiFoundryAiProjectResourceName
    location: azureAiServiceLocation
    tags: tags
    desc: aiFoundryAiProjectDescription
    aiServicesName: aiFoundryAiServicesResourceName
    azureExistingAIProjectResourceId: azureExistingAIProjectResourceId
  }
  dependsOn: [
    aiFoundryAiServices
  ]
}

var aiFoundryAiProjectEndpoint = useExistingAiFoundryAiProject
  ? 'https://${aiFoundryAiServicesResourceName}.services.ai.azure.com/api/projects/${aiFoundryAiProjectResourceName}'
  : aiFoundryAiServicesProject!.outputs.apiEndpoint

// ========== Role Assignments for Existing AI Services ========== //
module existingAiServicesRoleAssignments 'modules/deploy_foundry_role_assignment.bicep' = if (useExistingAiFoundryAiProject) {
  name: take('module.foundry-role-assignment.${aiFoundryAiServicesResourceName}', 64)
  scope: resourceGroup(aiFoundryAiServicesSubscriptionId, aiFoundryAiServicesResourceGroupName)
  params: {
    aiServicesName: aiFoundryAiServicesResourceName
    principalId: userAssignedIdentity.outputs.principalId
    principalType: 'ServicePrincipal'
  }
}

// ========== Storage Account ========== //
var storageAccountName = 'st${solutionSuffix}'
var contentContainer = 'content'

// ========== Azure Container Registry ========== //
module containerRegistry 'br/public:avm/res/container-registry/registry:0.8.0' = {
  name: take('avm.res.container-registry.registry.${acrResourceName}', 64)
  params: {
    #disable-next-line BCP334
    name: acrResourceName
    location: solutionLocation
    tags: tags
    enableTelemetry: enableTelemetry
    acrSku: enableScalability ? 'Premium' : 'Basic'
    acrAdminUserEnabled: true
    roleAssignments: [
      {
        principalId: userAssignedIdentity.outputs.principalId
        roleDefinitionIdOrName: '7f951dda-4ed3-4680-a7ca-43fe172d538d' // AcrPull
        principalType: 'ServicePrincipal'
      }
    ]
    diagnosticSettings: enableMonitoring ? [{ workspaceResourceId: logAnalyticsWorkspaceResourceId }] : null
  }
}

// ========== Storage Account ========== //
module storageAccount 'br/public:avm/res/storage/storage-account:0.30.0' = {
  name: take('avm.res.storage.storage-account.${storageAccountName}', 64)
  params: {
    name: storageAccountName
    location: solutionLocation
    skuName: enableRedundancy ? 'Standard_ZRS' : 'Standard_LRS'
    managedIdentities: { systemAssigned: true }
    minimumTlsVersion: 'TLS1_2'
    enableTelemetry: enableTelemetry
    tags: tags
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    blobServices: {
      containerDeleteRetentionPolicyEnabled: true
      containerDeleteRetentionPolicyDays: 7
      deleteRetentionPolicyEnabled: true
      deleteRetentionPolicyDays: 7
      containers: [
        {
          name: contentContainer
          publicAccess: 'None'
        }
      ]
    }
    roleAssignments: [
      {
        principalId: userAssignedIdentity.outputs.principalId
        roleDefinitionIdOrName: 'Storage Blob Data Contributor'
        principalType: 'ServicePrincipal'
      }
    ]
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: enablePrivateNetworking ? 'Deny' : 'Allow'
    }
    allowBlobPublicAccess: false
    publicNetworkAccess: enablePrivateNetworking ? 'Disabled' : 'Enabled'
    privateEndpoints: enablePrivateNetworking ? [
      {
        service: 'blob'
        subnetResourceId: virtualNetwork!.outputs.pepsSubnetResourceId
        privateDnsZoneGroup: {
          privateDnsZoneGroupConfigs: [
            { privateDnsZoneResourceId: avmPrivateDnsZones[dnsZoneIndex.storageBlob]!.outputs.resourceId }
          ]
        }
      }
    ] : null
    diagnosticSettings: enableMonitoring ? [{ workspaceResourceId: logAnalyticsWorkspaceResourceId }] : null
  }
}

// ========== App Service Plan ========== //
var webServerFarmResourceName = 'asp-${solutionSuffix}'
module webServerFarm 'br/public:avm/res/web/serverfarm:0.5.0' = {
  name: take('avm.res.web.serverfarm.${webServerFarmResourceName}', 64)
  params: {
    name: webServerFarmResourceName
    tags: tags
    enableTelemetry: enableTelemetry
    location: solutionLocation
    reserved: true
    kind: 'linux'
    diagnosticSettings: enableMonitoring ? [{ workspaceResourceId: logAnalyticsWorkspaceResourceId }] : null
    skuName: enableScalability || enableRedundancy ? 'P1v3' : 'B1'
    skuCapacity: 1
    zoneRedundant: enableRedundancy ? true : false
  }
  scope: resourceGroup(resourceGroup().name)
}

// ========== Web App (Frontend) ========== //
var webSiteResourceName = 'app-${solutionSuffix}'
var aciPrivateIpFallback = '10.0.4.4'
var aciPublicFqdnFallback = '${containerInstanceBackendName}.${solutionLocation}.azurecontainer.io'
var aciBackendUrl = enablePrivateNetworking
  ? 'http://${aciPrivateIpFallback}:8000'
  : 'http://${aciPublicFqdnFallback}:8000'

module webSite 'modules/web-sites.bicep' = {
  name: take('module.web-sites.${webSiteResourceName}', 64)
  params: {
    name: webSiteResourceName
    tags: tags
    location: solutionLocation
    kind: 'app,linux,container'
    serverFarmResourceId: webServerFarm.outputs.resourceId
    managedIdentities: { userAssignedResourceIds: [userAssignedIdentity!.outputs.resourceId] }
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerRegistry.outputs.loginServer}/loan-processing-frontend:${imageTag}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: userAssignedIdentity.outputs.clientId
      minTlsVersion: '1.2'
      alwaysOn: true
      ftpsState: 'FtpsOnly'
    }
    virtualNetworkSubnetId: enablePrivateNetworking ? virtualNetwork!.outputs.webSubnetResourceId : null
    configs: concat([
      {
        name: 'appsettings'
        properties: {
          DOCKER_REGISTRY_SERVER_URL: 'https://${containerRegistry.outputs.loginServer}'
          BACKEND_URL: aciBackendUrl
          AZURE_CLIENT_ID: userAssignedIdentity.outputs.clientId
        }
        applicationInsightResourceId: enableMonitoring ? applicationInsights!.outputs.resourceId : null
      }
    ], enableMonitoring ? [
      {
        name: 'logs'
        properties: {}
      }
    ] : [])
    enableMonitoring: enableMonitoring
    diagnosticSettings: enableMonitoring ? [{ workspaceResourceId: logAnalyticsWorkspaceResourceId }] : null
    vnetRouteAllEnabled: enablePrivateNetworking
    vnetImagePullEnabled: enablePrivateNetworking
    publicNetworkAccess: 'Enabled'
  }
}

// ========== Container Instance (Backend API) ========== //
var containerInstanceBackendName = 'aci-backend-${solutionSuffix}'
module containerInstanceBackend 'modules/container-instance.bicep' = if (deployContainers) {
  name: take('module.container-instance.${containerInstanceBackendName}', 64)
  params: {
    name: containerInstanceBackendName
    location: solutionLocation
    tags: tags
    containerImage: '${containerRegistry.outputs.loginServer}/loan-processing-backend:${imageTag}'
    acrLoginServer: containerRegistry.outputs.loginServer
    acrPullIdentityResourceId: userAssignedIdentity.outputs.resourceId
    cpu: 2
    memoryInGB: 4
    port: 8000
    subnetResourceId: enablePrivateNetworking ? virtualNetwork!.outputs.aciSubnetResourceId : ''
    userAssignedIdentityResourceId: userAssignedIdentity.outputs.resourceId
    enableTelemetry: enableTelemetry
    environmentVariables: [
      // Azure Foundry Settings (replaces Azure OpenAI direct)
      { name: 'USE_FOUNDRY', value: 'true' }
      { name: 'AZURE_AI_PROJECT_ENDPOINT', value: aiFoundryAiProjectEndpoint }
      { name: 'AZURE_AI_MODEL_DEPLOYMENT_NAME', value: gptModelName }
      { name: 'AZURE_OPENAI_ENDPOINT', value: 'https://${aiFoundryAiServicesResourceName}.openai.azure.com/' }
      { name: 'AZURE_OPENAI_CHAT_DEPLOYMENT_NAME', value: gptModelName }
      { name: 'AZURE_OPENAI_API_VERSION', value: azureOpenaiAPIVersion }
      // Azure Storage Settings
      { name: 'AZURE_STORAGE_ACCOUNT', value: storageAccountName }
      { name: 'AZURE_STORAGE_CONTAINER', value: contentContainer }
      // MCP Server Settings (internal reference to MCP sidecar)
      { name: 'LOAN_APPROVAL_MCP_URL', value: enablePrivateNetworking
        ? 'http://10.0.4.5:8080/mcp'
        : 'http://${containerInstanceMcpName}.${solutionLocation}.azurecontainer.io:8080/mcp' }
      // Identity Settings
      { name: 'AZURE_CLIENT_ID', value: userAssignedIdentity.outputs.clientId }
      { name: 'PROFILE', value: 'prod' }
      // Monitoring
      { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: enableMonitoring ? applicationInsights!.outputs.connectionString : '' }
      { name: 'ENABLE_OTEL', value: enableMonitoring ? 'true' : 'false' }
    ]
  }
}

// ========== Container Instance (MCP Loan Approval API) ========== //
var containerInstanceMcpName = 'aci-mcp-${solutionSuffix}'
module containerInstanceMcp 'modules/container-instance.bicep' = if (deployContainers) {
  name: take('module.container-instance.${containerInstanceMcpName}', 64)
  params: {
    name: containerInstanceMcpName
    location: solutionLocation
    tags: tags
    containerImage: '${containerRegistry.outputs.loginServer}/loan-processing-mcp:${imageTag}'
    acrLoginServer: containerRegistry.outputs.loginServer
    acrPullIdentityResourceId: userAssignedIdentity.outputs.resourceId
    cpu: 1
    memoryInGB: 2
    port: 8080
    subnetResourceId: enablePrivateNetworking ? virtualNetwork!.outputs.aciSubnetResourceId : ''
    userAssignedIdentityResourceId: userAssignedIdentity.outputs.resourceId
    enableTelemetry: enableTelemetry
    environmentVariables: [
      { name: 'PROFILE', value: 'prod' }
      { name: 'AZURE_CLIENT_ID', value: userAssignedIdentity.outputs.clientId }
    ]
  }
}

// ============== //
// Outputs        //
// ============== //

@description('Contains App Service Name')
output APP_SERVICE_NAME string = webSite.outputs.name

@description('Contains WebApp URL')
output WEB_APP_URL string = 'https://${webSite.outputs.name}.azurewebsites.net'

@description('Contains Storage Account Name')
output AZURE_STORAGE_ACCOUNT string = storageAccount.outputs.name

@description('Contains Storage Container')
output AZURE_STORAGE_CONTAINER string = contentContainer

@description('Contains Resource Group Name')
output RESOURCE_GROUP_NAME string = resourceGroup().name

@description('Contains AI Foundry Name')
output AI_FOUNDRY_NAME string = aiFoundryAiProjectResourceName

@description('Contains AI Foundry RG Name')
output AI_FOUNDRY_RG_NAME string = aiFoundryAiServicesResourceGroupName

@description('Contains AI Foundry Resource ID')
output AI_FOUNDRY_RESOURCE_ID string = useExistingAiFoundryAiProject ? '' : aiFoundryAiServices!.outputs.resourceId

@description('Contains existing AI project resource ID.')
output AZURE_EXISTING_AI_PROJECT_RESOURCE_ID string = azureExistingAIProjectResourceId

@description('Contains Azure OpenAI endpoint URL')
output AZURE_OPENAI_ENDPOINT string = 'https://${aiFoundryAiServicesResourceName}.openai.azure.com/'

@description('Contains GPT Model')
output AZURE_OPENAI_CHAT_DEPLOYMENT_NAME string = gptModelName

@description('Contains Azure OpenAI API Version')
output AZURE_OPENAI_API_VERSION string = azureOpenaiAPIVersion

@description('Contains OpenAI Resource')
output AZURE_OPENAI_RESOURCE string = aiFoundryAiServicesResourceName

@description('Contains AI Agent Endpoint')
output AZURE_AI_AGENT_ENDPOINT string = aiFoundryAiProjectEndpoint

@description('Contains AI Agent API Version')
output AZURE_AI_AGENT_API_VERSION string = azureAiAgentApiVersion

@description('Contains Application Insights Connection String')
output AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING string = (enableMonitoring && !useExistingLogAnalytics) ? applicationInsights!.outputs.connectionString : ''

@description('Contains the location used for AI Services deployment')
output AZURE_ENV_AI_LOCATION string = azureAiServiceLocation

@description('Contains Backend Container Instance Name')
output CONTAINER_INSTANCE_BACKEND_NAME string = deployContainers ? containerInstanceBackend!.outputs.name : ''

@description('Contains Backend Container Instance IP Address')
output CONTAINER_INSTANCE_BACKEND_IP string = deployContainers ? containerInstanceBackend!.outputs.ipAddress : ''

@description('Contains MCP Container Instance Name')
output CONTAINER_INSTANCE_MCP_NAME string = deployContainers ? containerInstanceMcp!.outputs.name : ''

@description('Contains MCP Container Instance IP Address')
output CONTAINER_INSTANCE_MCP_IP string = deployContainers ? containerInstanceMcp!.outputs.ipAddress : ''

@description('Contains ACR Name')
output ACR_NAME string = containerRegistry.outputs.name

@description('Contains ACR Login Server')
output ACR_LOGIN_SERVER string = containerRegistry.outputs.loginServer

@description('Contains flag for Azure AI Foundry usage')
output USE_FOUNDRY bool = true

@description('Contains Azure AI Project Endpoint')
output AZURE_AI_PROJECT_ENDPOINT string = aiFoundryAiProjectEndpoint

@description('Contains Azure AI Model Deployment Name')
output AZURE_AI_MODEL_DEPLOYMENT_NAME string = gptModelName
