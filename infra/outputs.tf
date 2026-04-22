output "vps_ip" {
  description = "Public IP of the axiomgarden VPS"
  value       = vultr_instance.axiomgarden.main_ip
}

output "ssh_command" {
  description = "SSH command to connect to the VPS"
  value       = "ssh -i .ssh/axiomgarden_ed25519 root@${vultr_instance.axiomgarden.main_ip}"
}

output "domain" {
  description = "Domain name pointing to the VPS"
  value       = var.domain
}
