#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

# Wait for any in-progress dpkg operations from cloud-init early phases
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do sleep 2; done

apt-get update -qq
apt-get install -y -qq \
  ufw fail2ban curl ca-certificates gnupg \
  unattended-upgrades nginx python3

# --- Docker ---
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker

# --- Firewall ---
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# --- fail2ban ---
systemctl enable fail2ban
systemctl start fail2ban

# --- App directory ---
mkdir -p /opt/axiomgarden

# --- Litestream config ---
cat > /opt/axiomgarden/litestream.yml << 'LEOF'
dbs:
  - path: /data/axiomgarden.db
    replicas:
      - type: s3
        bucket: ${litestream_bucket}
        path: db/
        endpoint: ${litestream_endpoint}
        region: us-east-1
        access-key-id: ${litestream_access_key}
        secret-access-key: ${litestream_secret_key}
        force-path-style: true
        sync-interval: 1s
LEOF
chmod 600 /opt/axiomgarden/litestream.yml

# --- Docker Compose ---
cat > /opt/axiomgarden/docker-compose.yml << 'CEOF'
services:
  restore:
    image: litestream/litestream:0.3
    volumes:
      - db_data:/data
      - /opt/axiomgarden/litestream.yml:/etc/litestream.yml:ro
    command: sh -c "[ -f /data/axiomgarden.db ] || litestream restore -if-replica-exists /data/axiomgarden.db"
    restart: "no"
  app:
    image: axiomgarden:${environment}
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - db_data:/app/data
    env_file:
      - .env
    depends_on:
      restore:
        condition: service_completed_successfully
  replicate:
    image: litestream/litestream:0.3
    volumes:
      - db_data:/data
      - /opt/axiomgarden/litestream.yml:/etc/litestream.yml:ro
    command: replicate
    restart: unless-stopped
    depends_on:
      restore:
        condition: service_completed_successfully
volumes:
  db_data:
CEOF

# --- App .env ---
cat > /opt/axiomgarden/.env << 'EEOF'
NODE_ENV=production
AUTH_URL=http://${domain}
AUTH_SECRET=${auth_secret}
DATABASE_URL=file:/app/data/axiomgarden.db
EEOF
chmod 600 /opt/axiomgarden/.env

# --- Nginx ---
cat > /etc/nginx/sites-available/axiomgarden << 'NEOF'
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NEOF
ln -sf /etc/nginx/sites-available/axiomgarden /etc/nginx/sites-enabled/axiomgarden
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl restart nginx

touch /opt/axiomgarden/.setup-complete
echo "axiomgarden setup complete at $(date)" >> /var/log/axiomgarden-setup.log
