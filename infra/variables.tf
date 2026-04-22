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

variable "domain" {
  description = "Root domain name (must already be registered in Namecheap)"
  type        = string
  default     = "axiomgarden.xyz"
}

variable "region" {
  description = "Vultr region slug"
  type        = string
  default     = "ewr" # New Jersey
}

variable "plan" {
  description = "Vultr plan slug"
  type        = string
  default     = "vc2-1c-2gb" # 1 vCPU, 2GB RAM, ~$12/mo
}
