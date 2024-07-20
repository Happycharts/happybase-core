import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import * as k8s from '@kubernetes/client-node';
import { execSync } from 'child_process';

export async function POST(request: NextRequest) {
  const { userId, orgId } = getAuth(request);

  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    // Create namespace based on Clerk organization ID
    const namespace = `trino-${orgId}`;
    await createNamespaceIfNotExists(k8sApi, namespace);

    // Deploy Trino using Helm
    deployTrinoWithHelm(namespace);

    return NextResponse.json({ message: 'Trino deployed successfully', namespace }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deploying Trino:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

async function createNamespaceIfNotExists(k8sApi: k8s.CoreV1Api, namespace: string) {
  try {
    await k8sApi.readNamespace(namespace);
  } catch (error: unknown) {
    if (error instanceof k8s.HttpError && error.response?.statusCode === 404) {
      const namespaceManifest = {
        metadata: {
          name: namespace,
        },
      };
      await k8sApi.createNamespace(namespaceManifest);
    } else {
      throw error;
    }
  }
}

function deployTrinoWithHelm(namespace: string) {
  // Assuming Helm is installed and configured on the system
  const command = `helm upgrade --install trino trino/trino \
    --namespace ${namespace} \
    --create-namespace \
    --set server.workers=2`;

  execSync(command);
}