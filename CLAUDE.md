# Axiom Garden

Mobile-first digital garden where daily check-ins grow procedurally generated L-system plants.

## Stack

- **Next.js 15** (App Router, server components)
- **Auth.js v5** with Credentials provider
- **Drizzle ORM** + **better-sqlite3** (WAL mode)
- **Litestream** for SQLite replication to Vultr Object Storage
- **Docker** + **Nginx** on Vultr VPS
- **Terraform** for infra (Vultr + Cloudflare)

## Deploying

Push to `main` to deploy to dev (`dev.axiomgarden.xyz`). The GitHub Actions workflow builds the Docker image, transfers it to the server, and restarts containers.

```bash
git push origin main
```

Claude can deploy directly by merging changes to `main` and pushing. No manual steps required.

## Dev setup

```bash
npm install
npm run dev
```

## Database

SQLite at `data/axiomgarden.db` locally, `file:/app/data/axiomgarden.db` in Docker. Schema managed by Drizzle migrations in `drizzle/`.

```bash
npm run db:generate   # generate migration after schema change
npm run db:migrate    # apply migrations
```

## Infrastructure

Terraform lives in `infra/`. Dev environment:

```bash
cd infra/environments/dev
terraform init
terraform apply
```

Secrets (API keys, SSH key) are gitignored. Server IP is committed at `infra/environments/dev/server_ip`.

## Key conventions

- All API routes and DB-querying pages export `export const dynamic = 'force-dynamic'` to prevent build-time DB access.
- Auth uses `trustHost: true` for correct operation behind Nginx.
- `DATABASE_URL` uses `file:` prefix (stripped in `lib/db.ts` before passing to better-sqlite3).
- Drizzle returns camelCase field names — types in `types/index.ts` match this.
