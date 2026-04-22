resource "tls_private_key" "axiomgarden" {
  algorithm = "ED25519"
}

# Save private key locally for SSH access
resource "local_sensitive_file" "private_key" {
  content         = tls_private_key.axiomgarden.private_key_openssh
  filename        = "${path.module}/../.ssh/axiomgarden_ed25519"
  file_permission = "0600"
}

resource "local_file" "public_key" {
  content  = tls_private_key.axiomgarden.public_key_openssh
  filename = "${path.module}/../.ssh/axiomgarden_ed25519.pub"
}

resource "vultr_ssh_key" "axiomgarden" {
  name    = "axiomgarden"
  ssh_key = tls_private_key.axiomgarden.public_key_openssh
}
