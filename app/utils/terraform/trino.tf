provider "kubernetes" {
  host                   = "https://${google_container_cluster.primary.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = google_container_cluster.primary.endpoint
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
  }
}

resource "helm_release" "trino" {
  name       = "trino"
  repository = "https://trinodb.github.io/charts"
  chart      = "trino"
  namespace  = "trino"
  create_namespace = true

  set {
    name  = "server.workers"
    value = var.gke_num_nodes
  }

  set {
  name  = "service.type"
  value = "LoadBalancer"
}

  set {
    name  = "server.config.query.maxMemory"
    value = "4GB"
  }

  depends_on = [google_container_node_pool.primary_nodes]
}

output "trino_endpoint" {
  value = "${helm_release.trino.name}.${helm_release.trino.namespace}.svc.cluster.local"
}