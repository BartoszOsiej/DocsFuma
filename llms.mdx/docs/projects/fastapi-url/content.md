# LinkShort (/docs/projects/fastapi-url)



# LinkShort [#linkshort]

<a class="tests-cta" href="./tests">🧪 View animated test results — 15/15 →</a>

> **A production-ready URL shortener — FastAPI backend, JWT auth, click tracking, React 19 SPA, SQLite.**

LinkShort (repository: `FastAPI-url`) is a complete URL-shortening service
with a Python/FastAPI API, JWT-based authentication, per-user link
management, click statistics, and a served single-page application frontend.

**Stack:** FastAPI (Python) · SQLAlchemy · SQLite · JWT (python-jose) ·
React 19 SPA (static files served by FastAPI) · pytest

## Highlights [#highlights]

* **Full auth flow** — register → login → JWT bearer tokens; `/auth/me`
  returns the current user
* **6-character short codes** — cryptographically random (`secrets`), with
  collision retry
* **Click tracking** — every redirect increments the click counter
* **Link expiration** — optional `expires_in_seconds` per link; expired
  links answer `410 Gone` while stats stay viewable
* **Per-user URLs** — `/urls/my` lists your links; deletes are owner-scoped
* **302 redirects** — `/urls/r/{code}` redirects to the target with a click
  recorded
* **Public stats** — `/urls/{code}/stats` returns target + click count
* **SPA serving** — FastAPI mounts the built React app and falls back to
  `index.html` for client-side routing
* **CORS open** — `allow_origins=["*"]` for development

## Tech stack [#tech-stack]

| Layer            | Technology                                                        |
| ---------------- | ----------------------------------------------------------------- |
| API              | FastAPI (`app = FastAPI(title="URL Shortener", version="1.0.0")`) |
| ORM              | SQLAlchemy (`Base.metadata.create_all` on startup)                |
| Database         | SQLite                                                            |
| Auth             | JWT bearer tokens (python-jose)                                   |
| Password hashing | `app/auth.py` (hashed, never stored plaintext)                    |
| Frontend         | React 19 SPA in `backend/static/`                                 |
| Tests            | pytest (`tests/test_api.py`)                                      |

## API surface [#api-surface]

| Method   | Path                 | Auth   | Description                    |
| -------- | -------------------- | ------ | ------------------------------ |
| `POST`   | `/auth/register`     | —      | Create account, receive JWT    |
| `POST`   | `/auth/login`        | —      | Authenticate, receive JWT      |
| `GET`    | `/auth/me`           | Bearer | Current user profile           |
| `POST`   | `/urls/shorten`      | Bearer | Shorten a URL                  |
| `GET`    | `/urls/my`           | Bearer | List your URLs (newest first)  |
| `GET`    | `/urls/{code}/stats` | —      | Public click stats             |
| `DELETE` | `/urls/{code}`       | Bearer | Delete your URL (owner-scoped) |
| `GET`    | `/urls/r/{code}`     | —      | 302 redirect + click count     |
| `GET`    | `/health`            | —      | Liveness probe                 |

## Repository layout [#repository-layout]

```
FastAPI-url/
├── app/
│   ├── main.py            # FastAPI app, CORS, SPA serving
│   ├── auth.py            # JWT creation/verification, password hashing
│   ├── database.py        # SQLAlchemy engine + session
│   ├── models.py          # User, URL models
│   ├── schemas.py         # Pydantic schemas (UserCreate, Token, URLOut, URLStats)
│   ├── config.py          # Settings
│   └── routers/
│       ├── auth_router.py # /auth/* endpoints
│       └── urls.py        # /urls/* endpoints
├── backend/static/        # Built React SPA (served by FastAPI)
├── tests/
│   └── test_api.py        # API integration tests
└── ...
```

## Short-code generation [#short-code-generation]

```python
def gen_short() -> str:
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(6))
```

6 characters from a 62-char alphabet ≈ **5.7×10¹⁰ combinations**; collisions
are checked and retried against the database.

## Related pages [#related-pages]

* [Getting Started](/docs/projects/fastapi-url/getting-started) — local setup and first run
* [API Reference](/docs/projects/fastapi-url/api-reference) — every endpoint with requests/responses
* [Deployment](/docs/projects/fastapi-url/deployment) — Docker, environments, production notes
