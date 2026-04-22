variable "vultr_api_key" {
  type      = string
  sensitive = true
}

variable "namecheap_user_name" {
  type = string
}

variable "namecheap_api_key" {
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
