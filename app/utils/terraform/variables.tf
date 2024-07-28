variable "project_id" {
  description = "The GCP project you want to enable APIs on"
}

variable "organization_id" {
  description = "The organization id for the associated services"
}

variable "billing_account" {
  description = "The ID of the billing account to associate this project with"
}

variable "project_name" {
  description = "The name of the project you want to create"
}
