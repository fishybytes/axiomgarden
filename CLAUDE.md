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

Docker is not available in this dev environment, so the build and transfer steps run on GitHub Actions runners. Claude should push to `main` to trigger a deploy — no other manual steps needed. The SSH key and server IP are available locally at `.ssh/axiomgarden_dev_ed25519` and `infra/environments/dev/server_ip` if Docker becomes available.

### Checking deploy status

`GH_TOKEN` is available in the environment. Use it to check GitHub Actions workflow runs:

```bash
# List recent runs
curl -s -H "Authorization: Bearer $GH_TOKEN" \
  "https://api.github.com/repos/fishybytes/axiomgarden/actions/runs?per_page=5" \
  | python3 -c "import sys,json; runs=json.load(sys.stdin)['workflow_runs']; [print(r['status'], r['conclusion'], r['created_at']) for r in runs]"

# Get logs for a specific run (replace RUN_ID)
curl -s -H "Authorization: Bearer $GH_TOKEN" \
  "https://api.github.com/repos/fishybytes/axiomgarden/actions/runs/RUN_ID/jobs" \
  | python3 -c "import sys,json; [print(j['name'], j['conclusion'], [s['name'] for s in j['steps'] if s['conclusion']=='failure']) for j in json.load(sys.stdin)['jobs']]"
```

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
