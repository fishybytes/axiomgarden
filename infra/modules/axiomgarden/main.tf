terraform {
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
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

resource "random_password" "auth_secret" {
  length  = 44
  special = false
}

# --- SSH Key ---

resource "tls_private_key" "axiomgarden" {
  algorithm = "ED25519"
}

resource "local_sensitive_file" "private_key" {
  content         = tls_private_key.axiomgarden.private_key_openssh
  filename        = "${path.root}/../../.ssh/axiomgarden_${var.environment}_ed25519"
  file_permission = "0600"
}

resource "local_file" "public_key" {
  content  = tls_private_key.axiomgarden.public_key_openssh
  filename = "${path.root}/../../.ssh/axiomgarden_${var.environment}_ed25519.pub"
}

resource "vultr_ssh_key" "axiomgarden" {
  name    = "axiomgarden-${var.environment}"
  ssh_key = tls_private_key.axiomgarden.public_key_openssh
}

# --- VPS ---

resource "vultr_instance" "axiomgarden" {
  plan        = var.plan
  region      = var.region
  os_id       = 2284 # Ubuntu 24.04 LTS x64
  hostname    = "axiomgarden-${var.environment}"
  label       = "axiomgarden-${var.environment}"
  ssh_key_ids = [vultr_ssh_key.axiomgarden.id]
  backups     = "disabled"

  connection {
    type        = "ssh"
    host        = self.main_ip
    user        = "root"
    private_key = tls_private_key.axiomgarden.private_key_openssh
    timeout     = "5m"
  }

  # Minimal bootstrap — just enough for Ansible to connect
  provisioner "remote-exec" {
    inline = [
      "apt-get update -qq",
      "DEBIAN_FRONTEND=noninteractive apt-get install -y -qq python3 python3-pip",
    ]
  }
}

# --- Object Storage (for Litestream SQLite replication) ---

resource "vultr_object_storage" "db" {
  cluster_id = var.object_storage_cluster_id
  label      = "axiomgarden-${var.environment}-db"
}

# --- DNS ---

resource "namecheap_domain_records" "axiomgarden" {
  domain = var.apex_domain
  mode   = "MERGE"

  record {
    hostname = var.subdomain
    type     = "A"
    address  = vultr_instance.axiomgarden.main_ip
    ttl      = 300
  }
}

# --- Ansible Inventory ---

locals {
  fqdn = var.subdomain == "@" ? var.apex_domain : "${var.subdomain}.${var.apex_domain}"
}

resource "local_sensitive_file" "ansible_inventory" {
  filename = "${path.root}/../../ansible/inventory/${var.environment}.ini"
  content  = <<-EOT
    [axiomgarden]
    ${vultr_instance.axiomgarden.main_ip} ansible_user=root ansible_ssh_private_key_file=../../.ssh/axiomgarden_${var.environment}_ed25519

    [axiomgarden:vars]
    environment=${var.environment}
    domain=${local.fqdn}
    litestream_bucket=axiomgarden-${var.environment}-db
    litestream_endpoint=https://${vultr_object_storage.db.s3_hostname}
    litestream_access_key=${vultr_object_storage.db.s3_access_key}
    litestream_secret_key=${vultr_object_storage.db.s3_secret_key}
    auth_secret=${random_password.auth_secret.result}
  EOT
  file_permission = "0600"
}
