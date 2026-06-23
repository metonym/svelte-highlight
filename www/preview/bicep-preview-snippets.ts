export type BicepPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bicepPreviewSnippets: BicepPreviewSnippet[] = [
  {
    title: "Storage account",
    description: "params, decorators, and resource declarations",
    code: `@description('The Azure region for resources')
param location string = resourceGroup().location

@allowed(['Standard_LRS', 'Standard_GRS'])
param skuName string = 'Standard_LRS'

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'st\${uniqueString(resourceGroup().id)}'
  location: location
  sku: {
    name: skuName
  }
  kind: 'StorageV2'
}

output storageId string = storage.id`,
  },
  {
    title: "Modules and loops",
    description: "module references and for expressions",
    code: `param names array = ['app', 'api', 'web']

module sites 'site.bicep' = [for name in names: {
  name: 'deploy-\${name}'
  params: {
    siteName: name
  }
}]`,
  },
];
