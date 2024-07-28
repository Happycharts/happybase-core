/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/******************************************
  Provider configuration
 *****************************************/
 
provider "google" {
  credentials = var.gcp_credentials
  project     = var.project_id
  region      = var.region
}

provider "kubernetes" {
  host                   = "https://${module.gke.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke.ca_certificate)
}

provider "helm" {
  kubernetes {
    config_path = module.gke.kube_config_content
  }
}

provider "google-beta" {
  credentials = var.gcp_credentials
  project     = var.project_id
  region      = var.region
}

locals {
  cluster_type = "node-pool"
}

data "google_client_config" "default" {}
module "project-services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "~> 15.0"

  project_id                  = module.project-factory.project_id
  enable_apis                 = true
  disable_services_on_destroy = true

  activate_api_identities = [{
    api = "container.googleapis.com"
    roles = [
      "roles/servviceusage.serviceUsageConsumer",
      "roles/container.clusterAdmin",
    ]
  }]
}

module "network" {
  source  = "terraform-google-modules/network/google//examples/basic_auto_mode"
  version = "9.1.0"
  project_id = module.project-factory.project_id
  network_name = var.network_name
  subnets = [
    "${var.environment}-app-${var.region}-a",
    "${var.environment}-backend-${var.region}-b",
    "${var.environment}-db-${var.region}-c"
  ]
}

module "project-factory" {
  source  = "terraform-google-modules/project-factory/google"
  version = "~> 15.0"

  random_project_id       = true
  name                    = var.project_name
  org_id                  = var.organization_id
  billing_account         = var.billing_account
  default_service_account = "DEPRIVILEGE"

  activate_api_identities = [{
    api = "container.googleapis.com"
    roles = [
      "roles/serviceusage.serviceUsageConsumer",
      "roles/container.clusterAdmin",
    ]
  }]
}

module "gke" {
  source  = "terraform-google-modules/kubernetes-engine/google//modules/beta-public-cluster"
  version = "~> 31.0"

  project_id                        = module.project-factory.project_id
  name                              = "${local.cluster_type}-cluster${var.cluster_name_suffix}"
  region                            = var.region
  network                           = module.network.network_name
  subnetwork                        = module.network
  ip_range_pods                     = module.network.subnets_ips["${var.environment}-app-${var.region}-a-pods"]
  ip_range_services                 = module.network.subnets_ips["${var.environment}-app-${var.region}-a-services"]
  create_service_account            = true
  remove_default_node_pool          = false
  disable_legacy_metadata_endpoints = false
  cluster_autoscaling               = var.cluster_autoscaling
  deletion_protection               = false

  node_pools = [
    {
      name            = "pool-01"
      min_count       = 1
      max_count       = 2
      service_account = "terraform@happybase-dev.iam.gserviceaccount.com"
      auto_upgrade    = true
    },
    {
      name              = "pool-02"
      machine_type      = "n1-standard-2"
      min_count         = 1
      max_count         = 2
      local_ssd_count   = 0
      disk_size_gb      = 30
      disk_type         = "pd-standard"
      accelerator_count = 1
      accelerator_type  = "nvidia-tesla-p4"
      auto_repair       = false
      service_account   = "terraform@happybase-dev.iam.gserviceaccount.com"
    },
    {
      name                      = "pool-03"
      machine_type              = "n1-standard-2"
      node_locations            = "${var.region}-b,${var.region}-c"
      autoscaling               = false
      node_count                = 2
      disk_type                 = "pd-standard"
      auto_upgrade              = true
      service_account           = "terraform@happybase-dev.iam.gserviceaccount.com"
      pod_range                 = "test"
      sandbox_enabled           = true
      cpu_manager_policy        = "static"
      cpu_cfs_quota             = true
      local_ssd_ephemeral_count = 2
      pod_pids_limit            = 4096
    },
    {
      name                = "pool-04"
      min_count           = 0
      service_account     = "terraform@happybase-dev.iam.gserviceaccount.com"
      queued_provisioning = true
    },
  ]

  node_pools_metadata = {
    pool-01 = {
      shutdown-script = "kubectl --kubeconfig=/var/lib/kubelet/kubeconfig drain --force=true --ignore-daemonsets=true --delete-local-data \"$HOSTNAME\""
    }
  }

  node_pools_labels = {
    all = {
      all-pools-example = true
    }
    pool-01 = {
      pool-01-example = true
    }
  }

  node_pools_taints = {
    all = [
      {
        key    = "all-pools-example"
        value  = true
        effect = "PREFER_NO_SCHEDULE"
      },
    ]
    pool-01 = [
      {
        key    = "pool-01-example"
        value  = true
        effect = "PREFER_NO_SCHEDULE"
      },
    ]
  }

  node_pools_tags = {
    all = [
      "all-node-example",
    ]
    pool-01 = [
      "pool-01-example",
    ]
  }

  node_pools_linux_node_configs_sysctls = {
    all = {
      "net.core.netdev_max_backlog" = "10000"
    }
    pool-01 = {
      "net.core.rmem_max" = "10000"
    }
    pool-03 = {
      "net.core.netdev_max_backlog" = "20000"
    }
  }
}

resource "helm_release" "nginx_ingress" {
  name       = "trino-helm"

  repository = "https://trinodb.github.io/charts"
  chart      = "trino"

  set {
    name  = "service.type"
    value = "NodePort"
  }
}