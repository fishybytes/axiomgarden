terraform {
  required_providers {
    vultr = {
      source  = "vultr/vultr"
      version = "~> 2.19"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
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
  filename        = "${path.root}/../../../.ssh/axiomgarden_${var.environment}_ed25519"
  file_permission = "0600"
}

resource "local_file" "public_key" {
  content  = tls_private_key.axiomgarden.public_key_openssh
  filename = "${path.root}/../../../.ssh/axiomgarden_${var.environment}_ed25519.pub"
}

resource "vultr_ssh_key" "axiomgarden" {
  name    = "axiomgarden-${var.environment}"
  ssh_key = tls_private_key.axiomgarden.public_key_openssh
}

# --- VPS ---

locals {
  fqdn = var.subdomain == "@" ? var.apex_domain : "${var.subdomain}.${var.apex_domain}"
}

resource "vultr_instance" "axiomgarden" {
  plan        = var.plan
  region      = var.region
  os_id       = 2284 # Ubuntu 24.04 LTS x64
  hostname    = "axiomgarden-${var.environment}"
  label       = "axiomgarden-${var.environment}"
  ssh_key_ids = [vultr_ssh_key.axiomgarden.id]
  backups     = "disabled"

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    environment           = var.environment
    domain                = local.fqdn
    litestream_bucket     = "axiomgarden-${var.environment}-db"
    litestream_endpoint   = "https://${vultr_object_storage.db.s3_hostname}"
    litestream_access_key = vultr_object_storage.db.s3_access_key
    litestream_secret_key = vultr_object_storage.db.s3_secret_key
    auth_secret           = random_password.auth_secret.result
  })
}

# --- Object Storage (for Litestream SQLite replication) ---

resource "vultr_object_storage" "db" {
  cluster_id = var.object_storage_cluster_id
  tier_id    = 2 # Standard — supports EWR; $18/mo base
  label      = "axiomgarden-${var.environment}-db"
}

# --- Object Storage Bucket ---

resource "terraform_data" "create_bucket" {
  triggers_replace = [vultr_object_storage.db.id]

  provisioner "local-exec" {
    interpreter = ["python3", "-c"]
    command     = <<-PYEOF
      import hmac, hashlib, base64, urllib.request, datetime
      endpoint   = "https://${vultr_object_storage.db.s3_hostname}"
      access_key = "${vultr_object_storage.db.s3_access_key}"
      secret_key = "${vultr_object_storage.db.s3_secret_key}"
      bucket     = "axiomgarden-${var.environment}-db"
      now        = datetime.datetime.utcnow()
      date_str   = now.strftime("%a, %d %b %Y %H:%M:%S GMT")
      sts        = f"PUT\n\n\n{date_str}\n/{bucket}/"
      sig        = base64.b64encode(hmac.new(secret_key.encode(), sts.encode(), hashlib.sha1).digest()).decode()
      req        = urllib.request.Request(f"{endpoint}/{bucket}/", method="PUT",
                     headers={"Date": date_str, "Authorization": f"AWS {access_key}:{sig}", "Content-Length": "0"})
      try:
          urllib.request.urlopen(req)
          print(f"bucket {bucket} ready")
      except urllib.error.HTTPError as e:
          if e.code == 409: print(f"bucket {bucket} already exists")
          else: raise
    PYEOF
  }
}

# --- DNS ---

resource "cloudflare_record" "axiomgarden" {
  zone_id = var.cloudflare_zone_id
  name    = var.subdomain
  content = vultr_instance.axiomgarden.main_ip
  type    = "A"
  ttl     = 300
  proxied = false
}

# --- Ansible Inventory (for ad-hoc config management) ---

resource "local_sensitive_file" "ansible_inventory" {
  filename = "${path.root}/../../../ansible/inventory/${var.environment}.ini"
  content  = <<-EOT
    [axiomgarden]
    ${vultr_instance.axiomgarden.main_ip} ansible_user=root ansible_ssh_private_key_file=../.ssh/axiomgarden_${var.environment}_ed25519

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

# --- VPS IP for CI/CD (non-sensitive, committed to repo) ---

resource "local_file" "server_ip" {
  content  = vultr_instance.axiomgarden.main_ip
  filename = "${path.root}/../../../infra/environments/${var.environment}/server_ip"
}
