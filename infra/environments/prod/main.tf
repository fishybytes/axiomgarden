module "axiomgarden" {
  source = "../../modules/axiomgarden"

  environment         = "prod"
  apex_domain         = var.apex_domain
  subdomain           = "@"
  plan                = "vc2-1c-2gb" # 1 vCPU, 2GB RAM
  region              = var.region
  vultr_api_key       = var.vultr_api_key
  namecheap_user_name = var.namecheap_user_name
  namecheap_api_key   = var.namecheap_api_key
}

output "vps_ip"      { value = module.axiomgarden.vps_ip }
output "ssh_command" { value = module.axiomgarden.ssh_command }
output "domain"      { value = module.axiomgarden.domain }
