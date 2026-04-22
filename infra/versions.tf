terraform {
  required_version = ">= 1.6"

  cloud {
    organization = "axiomgarden"
    workspaces {
      name = "axiomgarden-infra"
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
