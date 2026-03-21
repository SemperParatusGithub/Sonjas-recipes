# Production Docker Setup

## Quick Start

```bash
# 1. Configure environment
cp .env.template .env
nano .env  # Update DOMAIN, RECIPES_DOMAIN, passwords

# 2. Generate Traefik dashboard password
htpasswd -nb admin YOUR_PASSWORD | cut -d: -f2
# Add to .env as TRAEFIK_DASHBOARD_AUTH

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs -f traefik
```

## Configuration Steps

### Step 1: Environment Variables
Edit `.env`:
- `DOMAIN` - your main domain (e.g., example.com)
- `RECIPES_DOMAIN` - subdomain for recipe app (e.g., recipes.example.com)
- `DB_PASSWORD` - strong password for PostgreSQL
- `TRAEFIK_DASHBOARD_AUTH` - generate with htpasswd

### Step 2: Test with Staging CA
The config uses Let's Encrypt STAGING by default. This prevents rate limits during testing.

Check logs for certificate issuance:
```bash
docker-compose logs traefik | grep -i acme
```

### Step 3: Switch to Production CA
Once verified working, edit `traefik/traefik.yml`:
```yaml
caServer: https://acme-v02.api.letsencrypt.org/directory
```
Then restart: `docker-compose restart traefik`

### Step 4: Apply Firewall
```bash
chmod +x setup-firewall.sh
sudo ./setup-firewall.sh
```

## Files Structure
```
docker/
├── .env                    # Environment variables (create from template)
├── .env.template           # Template for .env
├── docker-compose.yml      # Main compose file
├── setup-firewall.sh      # Firewall script
├── traefik/
│   ├── traefik.yml        # Static config
│   ├── acme.json          # SSL certificates (auto-created)
│   ├── dynamic/
│   │   └── middleware.yml # Middleware config
│   └── logs/              # Traefik logs
├── landing/
│   ├── html/index.html    # Landing page
│   └── nginx.conf         # Nginx config
└── recipe-app/
    └── Dockerfile         # Next.js app
```

## Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs -f traefik
docker-compose logs -f recipe-app

# Restart a service
docker-compose restart recipe-app

# Stop all
docker-compose down

# Rebuild after changes
docker-compose build recipe-app
docker-compose up -d --force-recreate recipe-app

# Health check
curl http://localhost:3000/api/recipes
```

---

## ✅ PRODUCTION VALIDATION CHECKLIST

### Networking
- [ ] Only ports 80 and 443 exposed to host
- [ ] All services on `web` Docker network
- [ ] No container binds ports directly to host

### Traefik
- [ ] HTTP → HTTPS redirect working
- [ ] Let's Encrypt staging cert issued
- [ ] Rate limiting active
- [ ] Security headers applied
- [ ] Dashboard protected with basic auth
- [ ] Access logs enabled (JSON)

### Recipe App
- [ ] Container builds successfully
- [ ] Healthcheck passing
- [ ] TLS enabled
- [ ] Non-root user (uid 1001)
- [ ] Restart policy: unless-stopped
- [ ] Resource limits applied

### Landing Page
- [ ] Serves static HTML
- [ ] TLS enabled
- [ ] Rate limiting active
- [ ] Security headers applied

### Security
- [ ] `no-new-privileges:true` on all containers
- [ ] Capabilities dropped (ALL)
- [ ] Memory limits set
- [ ] CPU limits set
- [ ] HSTS enabled
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff

### Production CA (after testing)
- [ ] Switch to production Let's Encrypt
- [ ] Verify SSL in browser
- [ ] Check certificate auto-renewal
