import * as k8s from '@kubernetes/client-node';
import { execSync } from 'child_process';

export async function deployTrino(orgId: string) {
  try {
    const kubeConfigBase64 = process.env.KUBECONFIG_BASE64;
    if (!kubeConfigBase64) {
      throw new Error('KUBECONFIG_BASE64 environment variable is not set');
    }

    const kubeConfigContent = Buffer.from(kubeConfigBase64, 'base64').toString('utf-8');

    const kc = new k8s.KubeConfig();
    kc.loadFromString(kubeConfigContent);
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    const namespace = `trino-${orgId}`;
    await createNamespaceIfNotExists(k8sApi, namespace);

    deployTrinoWithHelm(namespace);

    return { message: 'Trino deployed successfully', namespace };
  } catch (error: unknown) {
    console.error('Error deploying Trino:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
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
  const command = `helm upgrade --install trino trino/trino \
    --namespace ${namespace} \
    --create-namespace \
    --set server.workers=2`;

  execSync(command);
}