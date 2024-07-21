import { NextRequest, NextResponse } from 'next/server';
import * as k8s from '@kubernetes/client-node';
import { CatalogConfig } from '@/app/types/catalog';
import { generateCatalogManifest, generateSecretManifest, generateNamespaceManifest } from '@/app/utils/catalogManifest';

export async function POST(request: NextRequest) {
  try {
    const { catalogConfig, secretData, namespace } = await request.json();

    // Initialize Kubernetes client using base64 encoded kubeconfig
    const kc = new k8s.KubeConfig();
    const kubeConfigBase64 = process.env.KUBECONFIG_BASE64;
    if (!kubeConfigBase64) {
      throw new Error('KUBECONFIG_BASE64 environment variable is not set');
    }
    const kubeConfigStr = Buffer.from(kubeConfigBase64, 'base64').toString('utf-8');
    kc.loadFromString(kubeConfigStr);

    const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
    const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);

    // Create namespace if it doesn't exist
    const namespaceManifest = generateNamespaceManifest(namespace);
    try {
      await coreV1Api.createNamespace(JSON.parse(namespaceManifest));
    } catch (error: unknown) {
      if (error instanceof k8s.HttpError) {
        // Ignore error if namespace already exists
        if (error.statusCode !== 409) {
          throw error;
        }
      } else {
        throw error;
      }
    }

    // Deploy the catalog
    const catalogManifest = generateCatalogManifest(catalogConfig);
    await k8sApi.createNamespacedCustomObject(
      'trino.stackable.tech',
      'v1alpha1',
      namespace,
      'trinocatalogs',
      JSON.parse(catalogManifest)
    );

    // Deploy the secret if secretData is provided
    if (secretData) {
      const secretManifest = generateSecretManifest(catalogConfig.name + '-secret', secretData);
      await coreV1Api.createNamespacedSecret(namespace, JSON.parse(secretManifest));
    }

    return NextResponse.json({ message: 'Catalog deployed successfully' });
  } catch (error: unknown) {
    console.error('Error deploying catalog:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}