provider "vultr" {
  api_key = var.vultr_api_key
}

provider "namecheap" {
  user_name   = var.namecheap_user_name
  api_user    = var.namecheap_user_name
  api_key     = var.namecheap_api_key
  use_sandbox = false
}
