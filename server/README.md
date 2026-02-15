# PocketBase Server

This folder contains the PocketBase backend setup for the starter template.

## Quickstart (Docker)

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Start PocketBase:

```bash
docker compose up -d
```

If PocketBase is already running, restart it after changing files:

```bash
docker compose down
docker compose up -d
```

3. Open PocketBase admin UI:

```
http://localhost:8090/_/
```

## Access URLs

- Admin UI: `http://localhost:8090/_/`
- API base: `http://localhost:8090/api/`
- Health check: `http://localhost:8090/api/health`

## Admin Credentials

- Set `PB_ADMIN_EMAIL` and `PB_ADMIN_PASSWORD` in `.env` before the first run.
- Use those values to sign in at the Admin UI.
- If you change them later, restart the container.

## Files

- `docker-compose.yml` - PocketBase container
- `pb_migrations/` - PocketBase migrations (schema, rules)
- `pb_hooks/` - PocketBase hooks (optional)
- `.env.example` - environment template
