output "project_info_example" {
  value       = module.project-factory.project_id
  description = "The ID of the created project"
}

output "domain_example" {
  value       = module.project-factory.domain
  description = "The organization's domain"
}