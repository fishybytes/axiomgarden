module "axiomgarden" {
  source = "../../modules/axiomgarden"

  environment         = "dev"
  apex_domain         = var.apex_domain
  subdomain           = "dev"
  plan                = "vc2-1c-1gb" # 1 vCPU, 1GB RAM — cheaper for dev
  region              = var.region
  vultr_api_key       = var.vultr_api_key
  namecheap_user_name = var.namecheap_user_name
  namecheap_api_key   = var.namecheap_api_key
}

output "vps_ip"      { value = module.axiomgarden.vps_ip }
output "ssh_command" { value = module.axiomgarden.ssh_command }
output "domain"      { value = module.axiomgarden.domain }
