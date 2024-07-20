// /app/api/trino/apply/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import * as k8s from '@kubernetes/client-node';
import { connectorTemplates, ConnectorConfig } from '@/app/utils/connectorMetadata';

export async function POST(req: NextRequest) {
  const { userId, orgId } = getAuth(req);

  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { connectorType, config } = body;

    if (!connectorTemplates[connectorType]) {
      return NextResponse.json({ error: 'Invalid connector type' }, { status: 400 });
    }

    const connectorConfig: ConnectorConfig = {
      ...connectorTemplates[connectorType],
      properties: {
        ...connectorTemplates[connectorType].properties,
        ...config,
      },
    };

    // Get the KUBECONFIG_BASE64 from environment variables
    const kubeConfigBase64 = process.env.KUBECONFIG_BASE64;
    if (!kubeConfigBase64) {
      throw new Error('KUBECONFIG_BASE64 environment variable is not set');
    }

    // Decode the base64-encoded KUBECONFIG
    const kubeConfigContent = Buffer.from(kubeConfigBase64, 'base64').toString('utf-8');

    // Initialize Kubernetes client with the decoded KUBECONFIG
    const kc = new k8s.KubeConfig();
    kc.loadFromString(kubeConfigContent);
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    const namespace = `trino-${orgId}`;
    const configMapName = `trino-${connectorConfig.name}-connector`;

    // Create or update ConfigMap
    const configMapData = Object.entries(connectorConfig.properties)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const configMap = new k8s.V1ConfigMap();
    configMap.metadata = new k8s.V1ObjectMeta();
    configMap.metadata.name = configMapName;
    configMap.metadata.namespace = namespace;
    configMap.data = {
      'catalog.properties': configMapData,
    };

    try {
      await k8sApi.readNamespacedConfigMap(configMapName, namespace);
      await k8sApi.replaceNamespacedConfigMap(configMapName, namespace, configMap);
    } catch (error: unknown) {
      if (error instanceof k8s.HttpError && error.response?.statusCode === 404) {
        await k8sApi.createNamespacedConfigMap(namespace, configMap);
      } else {
        throw error;
      }
    }

    const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);
    const deployments = await appsV1Api.listNamespacedDeployment(namespace);
    if (!deployments.body.items) {
      return NextResponse.json({ error: 'No Trino deployments found' }, { status: 404 });
    }
    for (const deployment of deployments.body.items) {
      if (deployment.metadata?.name && deployment.metadata.name.includes('trino')) {
        const patch = {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString(),
                },
              },
            },
          },
        };
        await appsV1Api.patchNamespacedDeployment(
          deployment.metadata.name,
          namespace,
          patch,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            headers: { 'Content-Type': 'application/strategic-merge-patch+json' }
          }
        );
      }
    }

    return NextResponse.json({ message: 'Connector configuration applied successfully' });
  } catch (error: unknown) {
    console.error('Error applying Trino connector configuration:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}