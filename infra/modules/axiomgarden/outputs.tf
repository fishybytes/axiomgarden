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
  value       = var.subdomain == "@" ? var.apex_domain : "${var.subdomain}.${var.apex_domain}"
}
