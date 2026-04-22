variable "apex_domain" {
  description = "Registered apex domain (e.g. axiomgarden.xyz)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain hostname for this environment. Use @ for apex (prod) or a name like dev"
  type        = string
  default     = "@"
}

variable "region" {
  description = "Vultr region slug"
  type        = string
  default     = "ewr"
}

variable "plan" {
  description = "Vultr plan slug"
  type        = string
}

variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod"
  }
}

variable "object_storage_cluster_id" {
  description = "Vultr object storage cluster ID (2 = EWR/New Jersey)"
  type        = number
  default     = 2
}
