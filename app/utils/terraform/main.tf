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
 
module "project-services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "~> 15.0"

  project_id                  = var.project_id
  enable_apis                 = var.enable
  disable_services_on_destroy = true

  activate_api_identities = [{
    api = "container.googleapis.com"
    roles = [
      "roles/servviceusage.serviceUsageConsumer",
      "roles/container.clusterAdmin",
    ]
  }]
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

resource "google_cloud_run_v2_service" "default" {
  name     = "cloudrun-service"
  location = "us-central1"
  project  = module.project-factory.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }
}