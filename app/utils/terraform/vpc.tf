# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

variable "project_id" {
  description = "project id"
}

variable "region" {
  description = "region"
}

variable "zone" {
  description = "zone"
}

data "google_client_config" "default" {}

provider "google" {
  project = var.project_id
  zone = var.zone
}

# VPC
resource "google_compute_network" "vpc" {
  name                    = "${var.project_id}-vpc"
  auto_create_subnetworks = "false"
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.project_id}-subnet"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.10.0.0/24"
}

resource "google_compute_firewall" "allow_trino_access" {
  name    = "allow-trino-access"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = ["443"]  // For HTTPS
  }

  // Replace with your actual IP address
  source_ranges = ["108.204.32.89/32"]

  target_tags = ["gke-node", "${var.project_id}-gke"]
}