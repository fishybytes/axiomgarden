# Manage DNS records for the domain (domain must already be registered in Namecheap)
resource "namecheap_domain_records" "axiomgarden" {
  domain = var.domain
  mode   = "OVERWRITE"

  record {
    hostname = "@"
    type     = "A"
    address  = vultr_instance.axiomgarden.main_ip
    ttl      = 300
  }

  record {
    hostname = "www"
    type     = "A"
    address  = vultr_instance.axiomgarden.main_ip
    ttl      = 300
  }
}
