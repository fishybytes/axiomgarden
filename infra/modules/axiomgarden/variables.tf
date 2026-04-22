variable "vultr_api_key" {
  description = "Vultr API key"
  type        = string
  sensitive   = true
}

variable "namecheap_user_name" {
  description = "Namecheap account username"
  type        = string
}

variable "namecheap_api_key" {
  description = "Namecheap API key"
  type        = string
  sensitive   = true
}

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
