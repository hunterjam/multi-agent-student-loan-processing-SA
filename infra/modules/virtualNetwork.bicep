// ========== virtualNetwork.bicep ========== //
// Virtual Network module for private networking support

@description('Required. Name of the virtual network.')
param vnetName string

@description('Required. Location of the virtual network.')
param vnetLocation string

@description('Required. Address prefixes for the VNet.')
param vnetAddressPrefixes array

@description('Optional. Tags for resources.')
param tags object = {}

@description('Optional. Log Analytics Workspace ID for diagnostics.')
param logAnalyticsWorkspaceId string = ''

@description('Optional. Enable telemetry.')
param enableTelemetry bool = true

@description('Required. Resource suffix for naming.')
param resourceSuffix string

@description('Optional. Deploy Azure Bastion and Jumpbox VM.')
param deployBastionAndJumpbox bool = false

// ============== //
// Subnet Definitions //
// ============== //

var baseSubnets = [
  {
    name: 'snet-web-${resourceSuffix}'
    addressPrefix: '10.0.0.0/24'
    delegation: 'Microsoft.Web/serverFarms'
  }
  {
    name: 'snet-peps-${resourceSuffix}'
    addressPrefix: '10.0.1.0/24'
  }
  {
    name: 'snet-aci-${resourceSuffix}'
    addressPrefix: '10.0.4.0/24'
    delegation: 'Microsoft.ContainerInstance/containerGroups'
  }
]

var bastionSubnets = deployBastionAndJumpbox
  ? [
      {
        name: 'AzureBastionSubnet'
        addressPrefix: '10.0.2.0/26'
      }
      {
        name: 'snet-jumpbox-${resourceSuffix}'
        addressPrefix: '10.0.3.0/24'
      }
    ]
  : []

var allSubnets = concat(baseSubnets, bastionSubnets)

// ============== //
// Resources      //
// ============== //

module vnet 'br/public:avm/res/network/virtual-network:0.6.1' = {
  name: take('avm.res.network.virtual-network.${vnetName}', 64)
  params: {
    name: vnetName
    location: vnetLocation
    tags: tags
    enableTelemetry: enableTelemetry
    addressPrefixes: vnetAddressPrefixes
    subnets: [
      for subnet in allSubnets: {
        name: subnet.name
        addressPrefix: subnet.addressPrefix
        delegation: subnet.?delegation
      }
    ]
    diagnosticSettings: !empty(logAnalyticsWorkspaceId) ? [{ workspaceResourceId: logAnalyticsWorkspaceId }] : null
  }
}

// ============== //
// Outputs        //
// ============== //

@description('The resource ID of the virtual network.')
output resourceId string = vnet.outputs.resourceId

@description('The resource ID of the web subnet.')
output webSubnetResourceId string = vnet.outputs.subnetResourceIds[0]

@description('The resource ID of the private endpoints subnet.')
output pepsSubnetResourceId string = vnet.outputs.subnetResourceIds[1]

@description('The resource ID of the ACI subnet.')
output aciSubnetResourceId string = vnet.outputs.subnetResourceIds[2]
