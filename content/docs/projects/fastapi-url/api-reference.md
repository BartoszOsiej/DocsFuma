---
description: All endpoints are JSON. Authentication uses a JWT bearer token returned by `/auth/register` and `/auth/login`. Interactive docs are available at
keywords:
- Bartosz Osiej Docs
- API reference
- Bash
- AST
- documentation
title: API Reference
---
# API Reference

All endpoints are JSON. Authentication uses a JWT bearer token returned by
`/auth/register` and `/auth/login`. Interactive docs are available at
`/docs` (Swagger UI) when the server is running.

## Base URL

```
http://localhost:8000
```

## Authentication

### `POST /auth/register`

Create an account and receive a JWT.

**Request body**

```json
{ "email": "you@example.com", "password": "hunter2" }
```

**Responses**

| Status | Body |
|---|---|
| 200 | `{ "access_token": "&lt;jwt&gt;", "token_type": "bearer" }` |
| 400 | `{ "detail": "Email already registered" }` |

### `POST /auth/login`

Authenticate and receive a JWT.

**Request body**

```json
{ "email": "you@example.com", "password": "hunter2" }
```

**Responses**

| Status | Body |
|---|---|
| 200 | `{ "access_token": "&lt;jwt&gt;", "token_type": "bearer" }` |
| 401 | `{ "detail": "Incorrect email or password" }` |

### `GET /auth/me`

Return the authenticated user's profile.

**Headers**

```
Authorization: Bearer <jwt>
```

**Responses**

| Status | Body |
|---|---|
| 200 | `{ "id": 1, "email": "you@example.com" }` |
| 401 | `{ "detail": "Not authenticated" }` |

## URLs

All `/urls` routes except stats and redirect require a JWT bearer header.

### `POST /urls/shorten`

Create a short URL.

**Request** — query parameter `target_url` (a bare scalar in the FastAPI
handler, so it is a query parameter, not a JSON body):

```
POST /urls/shorten?target_url=https://example.com/very/long/path
```

```bash
curl -s -X POST 'http://localhost:8000/urls/shorten?target_url=https://example.com/very/long/path' \
  -H 'Authorization: Bearer <jwt>'
```

**Response 200**

```json
{
  "id": 12,
  "short_code": "Ab3xY9",
  "target_url": "https://example.com/very/long/path",
  "clicks": 0,
  "is_active": true
}
```

### `GET /urls/my`

List the authenticated user's URLs, newest first.

**Response 200**

```json
[
  {
    "id": 12,
    "short_code": "Ab3xY9",
    "target_url": "https://example.com/very/long/path",
    "clicks": 3,
    "is_active": true
  }
]
```

### `GET /urls/{short_code}/stats`

Public click statistics for any short code.

**Response 200**

```json
{
  "short_code": "Ab3xY9",
  "target_url": "https://example.com/very/long/path",
  "clicks": 3,
  "total": 3
}
```

| Status | Body |
|---|---|
| 404 | `{ "detail": "Not Found" }` |

### `DELETE /urls/{short_code}`

Delete a URL. **Owner-scoped** — only the user who created the URL can
delete it. Returns `204 No Content` on success.

| Status | Detail |
|---|---|
| 204 | Deleted |
| 404 | URL not found or not owned by you |

### `GET /urls/r/{short_code}`

Redirect to the target URL and increment the click counter.

**Responses**

| Status | Detail |
|---|---|
| 302 | Redirect to `target_url` |
| 404 | `{ "detail": "URL not found" }` (inactive URLs are ignored) |

Only **active** URLs redirect — `is_active = true` is required.

## System

### `GET /health`

Liveness probe.

```json
{ "status": "ok" }
```

## Data model

**User** — `id`, `email` (unique), `password_hash`

**URL** — `id`, `short_code` (unique), `target_url`, `owner_id` (FK → User),
`clicks` (int, default 0), `is_active` (bool), `created_at`

## Error format

FastAPI errors follow the standard shape:

```json
{ "detail": "Human-readable message" }
```
