# Sonja's Kitchen — Production Deployment

Traefik v3 reverse proxy + Next.js app, deployed via Docker Compose.

## Prerequisites

- VPS with Docker + Docker Compose v2 installed
- Domain with DNS A records pointing at your VPS IP:
  - `yourdomain.com` → VPS IP
  - `www.yourdomain.com` → VPS IP
  - `traefik.yourdomain.com` → VPS IP (for dashboard)
- Ports 80 and 443 open in your firewall
- `apache2-utils` for generating passwords: `apt install apache2-utils`

---

## First-time setup

### 1. Configure environment

```bash
cd docker
cp .env.template .env
nano .env
```

Fill in:
- `DOMAIN` — your apex domain, e.g. `sonjas-recipes.com`
- `ACME_EMAIL` — email for Let's Encrypt expiry notices
- `TRAEFIK_DASHBOARD_AUTH` — generate with:

```bash
htpasswd -nB admin
# Paste the output into TRAEFIK_DASHBOARD_AUTH in .env
# Escape every $ as $$ (Docker Compose requirement)
# Example: admin:$$2y$$05$$...
```

### 2. Create acme.json

Traefik stores certificates here. It must exist and be readable only by root:

```bash
touch traefik/acme.json
chmod 600 traefik/acme.json
```

### 3. Build and start

```bash
# Run from the repo root (one level above docker/)
docker compose -f docker/docker-compose.yml up -d --build
```

### 4. Verify

```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f
curl -I https://yourdomain.com
```

---

## Persistent data

All state is stored in named Docker volumes — it survives rebuilds and restarts:

| Volume | Contents |
|---|---|
| `recipe-db` | SQLite database |
| `recipe-uploads` | User-uploaded images |
| `traefik-acme` | Let's Encrypt certificates |
| `traefik-logs` | Traefik access + error logs |

---

## Updating the app

```bash
git pull
docker compose -f docker/docker-compose.yml up -d --build recipe-app
```

---

## Useful commands

```bash
# View all logs
docker compose -f docker/docker-compose.yml logs -f

# Restart one service
docker compose -f docker/docker-compose.yml restart recipe-app

# Stop everything (data is preserved in volumes)
docker compose -f docker/docker-compose.yml down

# Stop and delete all data (⚠ irreversible)
docker compose -f docker/docker-compose.yml down -v
```

---

## Troubleshooting

**Certificate not issued**
- Port 80 must be publicly reachable for the HTTP-01 ACME challenge
- Check DNS propagation: `dig yourdomain.com`
- Check Traefik logs: `docker compose logs traefik | grep -i acme`

**App won't start**
```bash
docker compose -f docker/docker-compose.yml logs recipe-app
```

**Reset certificates** (if Let's Encrypt state is corrupted)
```bash
docker compose -f docker/docker-compose.yml down
docker volume rm sonjas-recipes_traefik-acme
touch traefik/acme.json && chmod 600 traefik/acme.json
docker compose -f docker/docker-compose.yml up -d
```
