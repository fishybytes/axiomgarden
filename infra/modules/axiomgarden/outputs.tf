output "vps_ip" {
  description = "Public IP of the VPS"
  value       = vultr_instance.axiomgarden.main_ip
}

output "ssh_command" {
  description = "SSH command to connect to the VPS"
  value       = "ssh -i .ssh/axiomgarden_${var.environment}_ed25519 root@${vultr_instance.axiomgarden.main_ip}"

}

output "domain" {
  description = "FQDN for this environment"
  value       = local.fqdn
}

output "object_storage_endpoint" {
  description = "Vultr object storage S3 endpoint"
  value       = "https://${vultr_object_storage.db.s3_hostname}"
}

output "object_storage_bucket" {
  description = "Litestream replication bucket name"
  value       = "axiomgarden-${var.environment}-db"
}

output "auth_secret" {
  description = "AUTH_SECRET for Next.js Auth.js"
  value       = random_password.auth_secret.result
  sensitive   = true
}
