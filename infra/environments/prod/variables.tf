variable "vultr_api_key" {
  type      = string
  sensitive = true
}

variable "apex_domain" {
  type    = string
  default = "axiomgarden.xyz"
}

variable "region" {
  type    = string
  default = "ewr"
}
