---
description: Run LinkShort locally in a few minutes. You need Python 3.12+ and Node.js 18+.
keywords:
- Bartosz Osiej Docs
- getting started
- Python
- Bash
- AST
- documentation
title: Getting Started
---
# Getting Started

Run LinkShort locally in a few minutes. You need Python 3.12+ and Node.js 18+.

## 1. Clone and prepare the backend

```bash
git clone https://github.com/BartoszOsiej/Shortlink.git
cd FastAPI-url

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. Configure environment

Copy the example environment file and set a secret key:

```bash
cp .env.example .env
# edit .env — set SECRET_KEY to a long random string
```

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | JWT signing secret (change in production!) |
| `DATABASE_URL` | Defaults to a local SQLite file |

## 3. Start the API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open:

- **App + Swagger UI:** [localhost:8000](https://localhost:8000)
- **Interactive API docs:** [localhost:8000/docs](https://localhost:8000/docs)

The SQLite database is created automatically on startup
(`Base.metadata.create_all`).

## 4. Build the frontend (optional, for the SPA)

```bash
cd frontend
npm install
npm run build
rm -rf ../backend/static
mkdir -p ../backend/static
cp -r dist/* ../backend/static/
```

FastAPI serves the compiled SPA from `backend/static` — including a catch-all
route that returns `index.html` for client-side routing.

## 5. Run the tests

```bash
pip install pytest httpx
python -m pytest tests/ -v --tb=long
```

The same test suite runs in CI (`.github/workflows/ci.yml`) on every push and
pull request with Python 3.12.

## First API call

```bash
# Register (returns a JWT)
curl -s -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email": "you@example.com", "password": "hunter2"}'

# Shorten a URL (target_url is a query parameter; Authorization: Bearer <token>)
curl -s -X POST 'http://localhost:8000/urls/shorten?target_url=https://example.com/very/long/path' \
  -H 'Authorization: Bearer <token>'

# Redirect (public)
curl -sI http://localhost:8000/urls/r/<short_code>
# → HTTP/2 302, Location: https://example.com/very/long/path

# Stats (public)
curl -s http://localhost:8000/urls/<short_code>/stats
```

## Project tour

```
app/
├── main.py            # FastAPI app, CORS, health, SPA serving
├── auth.py            # JWT create/verify + password hashing
├── database.py        # SQLAlchemy engine, session, Base
├── models.py          # User + URL SQLAlchemy models
├── schemas.py         # Pydantic request/response schemas
├── config.py          # Settings (secret key, DB URL)
└── routers/
    ├── auth_router.py # POST /auth/register|login, GET /auth/me
    └── urls.py        # POST /urls/shorten, GET /urls/my|{code}/stats,
                       # DELETE /urls/{code}, GET /urls/r/{code}
tests/
└── test_api.py        # pytest integration tests
backend/static/        # compiled React SPA
```

## How authentication works

1. `POST /auth/register` hashes the password and issues a signed JWT.
2. Every protected route reads `Authorization: Bearer &lt;jwt&gt;`.
3. `get_current_user` (in `app/auth.py`) verifies the token and resolves the
   user for the request.

## Next steps

- Explore every endpoint in the [API Reference](./api-reference.md)
- Deploy with [Docker or Fly.io](./deployment.md)
