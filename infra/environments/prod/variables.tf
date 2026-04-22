variable "vultr_api_key" {
  type      = string
  sensitive = true
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_zone_id" {
  type = string
}

variable "apex_domain" {
  type    = string
  default = "axiomgarden.xyz"
}

variable "region" {
  type    = string
  default = "ewr"
}
