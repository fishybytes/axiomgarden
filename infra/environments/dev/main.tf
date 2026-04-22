module "axiomgarden" {
  source = "../../modules/axiomgarden"

  environment = "dev"
  apex_domain = var.apex_domain
  subdomain   = "dev"
  plan        = "vc2-1c-1gb" # 1 vCPU, 1GB RAM — cheaper for dev
  region      = var.region
}

output "vps_ip"      { value = module.axiomgarden.vps_ip }
output "ssh_command" { value = module.axiomgarden.ssh_command }
output "domain"      { value = module.axiomgarden.domain }
