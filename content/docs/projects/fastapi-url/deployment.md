---
description: 'LinkShort ships with three deployment options: Docker, Docker Compose, and Fly.io.'
keywords:
- Bartosz Osiej Docs
- architecture
- deployment
- browser
- Bash
- AST
- documentation
title: Deployment
---
# Deployment

LinkShort ships with three deployment options: Docker, Docker Compose, and
Fly.io.

## Docker

A multi-stage `Dockerfile` builds the React frontend and packages the FastAPI
app into a single image.

```bash
docker build -t linkshort .

# SQLite file lives in /app/data (volume mount recommended)
docker run -p 8000:8000 \
  -e SECRET_KEY=change-me \
  -v ./data:/app/data \
  linkshort
```

## Docker Compose

The provided `docker-compose.yml` wires the image, port, env vars, and a data
volume:

```bash
docker compose up -d
```

| Key | Value |
|---|---|
| Image | built from the repo |
| Port | `8000:8000` |
| `DATABASE_URL` | `sqlite:///./urlshortener.db` |
| Volume | `./data:/app/data` |

## Fly.io

`fly.toml` is included for one-command deployment:

```bash
fly launch   # first time only
fly deploy
```

## Deployment architecture

```
Browser
   │  HTTPS
   ▼
Fly.io / Docker host
   │  uvicorn: app.main:app
   ├── /auth/*        → JWT auth
   ├── /urls/*        → shorten, my, stats, delete, redirect
   ├── /health        → liveness
   └── /* (SPA)       → static files / index.html fallback
   │
   ▼
SQLite (volume-mounted /app/data)
```

## Production checklist

- [ ] Set a long, random `SECRET_KEY` (never commit it)
- [ ] Mount persistent storage for the SQLite database
- [ ] Run behind TLS (Fly.io provides it automatically)
- [ ] Confirm `backend/static` contains a fresh frontend build
- [ ] Restrict CORS origins instead of the dev `*` wildcard if needed
- [ ] Back up the SQLite file regularly (single-file backups are trivial)
- [ ] Monitor `/health` with your uptime checker
