resource "vultr_instance" "axiomgarden" {
  plan        = var.plan
  region      = var.region
  os_id       = 2284 # Ubuntu 24.04 LTS x64
  hostname    = "axiomgarden"
  label       = "axiomgarden"
  ssh_key_ids = [vultr_ssh_key.axiomgarden.id]
  backups     = "disabled"

  connection {
    type        = "ssh"
    host        = self.main_ip
    user        = "root"
    private_key = tls_private_key.axiomgarden.private_key_openssh
    timeout     = "5m"
  }

  provisioner "remote-exec" {
    inline = [
      # Basics
      "apt-get update -qq",
      "DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl gnupg ufw fail2ban",

      # Docker
      "install -m 0755 -d /etc/apt/keyrings",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg",
      "chmod a+r /etc/apt/keyrings/docker.gpg",
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "apt-get update -qq",
      "DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      "systemctl enable docker && systemctl start docker",

      # Nginx + Certbot
      "DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx certbot python3-certbot-nginx",
      "systemctl enable nginx && systemctl start nginx",

      # Firewall
      "ufw default deny incoming",
      "ufw default allow outgoing",
      "ufw allow ssh",
      "ufw allow http",
      "ufw allow https",
      "ufw --force enable",

      # App directory
      "mkdir -p /opt/axiomgarden",
    ]
  }
}
