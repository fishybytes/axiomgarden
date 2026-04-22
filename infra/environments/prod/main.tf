module "axiomgarden" {
  source = "../../modules/axiomgarden"

  environment = "prod"
  apex_domain = var.apex_domain
  subdomain   = "@"
  plan        = "vc2-1c-2gb" # 1 vCPU, 2GB RAM
  region      = var.region
}

output "vps_ip"      { value = module.axiomgarden.vps_ip }
output "ssh_command" { value = module.axiomgarden.ssh_command }
output "domain"      { value = module.axiomgarden.domain }
