// ========== web-sites.config.bicep ========== //
// App Service configuration sub-module

@description('Required. The name of the parent site resource.')
param appName string

@description('Required. The name of the site config (appsettings or logs).')
@allowed([
  'appsettings'
  'logs'
])
param name string

@description('Optional. Resource ID of the application insight to leverage for this resource.')
param applicationInsightResourceId string?

@description('Optional. The app settings key-value pairs.')
param properties object?

@description('Optional. The current app settings to merge with.')
param currentAppSettings object = {}

@description('Optional. Enable monitoring and logging configuration.')
param enableMonitoring bool = false

// Gather Application Insights settings if monitoring enabled
var appInsightsSettings = !empty(applicationInsightResourceId) && enableMonitoring
  ? {
      APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsResource!.properties.ConnectionString
      ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
    }
  : {}

resource appInsightsResource 'Microsoft.Insights/components@2020-02-02' existing = if (!empty(applicationInsightResourceId) && enableMonitoring) {
  name: last(split(applicationInsightResourceId ?? 'dummy', '/'))!
}

// Merge settings
var mergedProperties = name == 'appsettings'
  ? union(currentAppSettings, properties ?? {}, appInsightsSettings)
  : (properties ?? {})

resource app 'Microsoft.Web/sites@2024-04-01' existing = {
  name: appName
}

resource appConfig 'Microsoft.Web/sites/config@2024-04-01' = {
  parent: app
  name: name
  properties: mergedProperties
}
