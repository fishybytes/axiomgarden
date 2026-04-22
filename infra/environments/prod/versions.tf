terraform {
  required_version = ">= 1.6"

  cloud {
    organization = "axiomgarden"
    workspaces {
      name = "axiomgarden-infra-prod"
    }
  }

  required_providers {
    vultr = {
      source  = "vultr/vultr"
      version = "~> 2.19"
    }
    namecheap = {
      source  = "namecheap/namecheap"
      version = "~> 2.1"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

provider "vultr" {
  api_key = var.vultr_api_key
}

provider "namecheap" {
  user_name   = var.namecheap_user_name
  api_user    = var.namecheap_user_name
  api_key     = var.namecheap_api_key
  use_sandbox = false
}
