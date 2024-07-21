import { CatalogConfig } from '../types/catalog';

export function generateCatalogManifest(config: CatalogConfig): string {
  const manifest = {
    apiVersion: 'trino.stackable.tech/v1alpha1',
    kind: 'TrinoCatalog',
    metadata: {
      name: config.name,
      labels: config.labels,
    },
    spec: config.spec,
  };

  return JSON.stringify(manifest);
}

export function generateSecretManifest(name: string, data: Record<string, string>): string {
  const manifest = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: name,
    },
    stringData: data,
  };

  return JSON.stringify(manifest);
}

export function generateNamespaceManifest(name: string): string {
  const manifest = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name: name,
    },
  };

  return JSON.stringify(manifest);
}