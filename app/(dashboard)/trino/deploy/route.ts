import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import * as k8s from '@kubernetes/client-node';
import { execSync } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, orgId } = getAuth(req);

  if (!userId || !orgId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize Kubernetes client
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    // Create namespace based on Clerk organization ID
    const namespace = `trino-${orgId}`;
    await createNamespaceIfNotExists(k8sApi, namespace);

    // Deploy Trino using Helm
    deployTrinoWithHelm(namespace);

    return res.status(200).json({ message: 'Trino deployed successfully', namespace });
  } catch (error: unknown) {
    console.error('Error deploying Trino:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'An unknown error occurred' });
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