---
description: Lightweight web vulnerability scanner — a four-phase assessment of a single target.
keywords:
- Bartosz Osiej Docs
- security
- Rust
- ECS
- documentation
title: ShadowScan
---
# ShadowScan

Lightweight web vulnerability scanner — a four-phase assessment of a single
target.

## Overview

ShadowScan performs **four checks** against a target URL:

1. **Security header audit** — checks 8 security headers (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP, X-XSS-Protection)
2. **TLS / certificate inspection** — for `https://` targets (subject, issuer, expiry, negotiated version, cipher)
3. **Injection probes** — reflected XSS payloads + error-based SQLi signatures
4. **Common path discovery** — 33 paths probed for interesting status codes

## Usage

```
shadowscan <url> [--timeout SECS]

EXAMPLES:
  shadowscan https://example.com
  shadowscan http://192.168.1.10:8080 --timeout 5
```

The URL is normalized automatically: missing scheme becomes `http://`,
trailing slashes are stripped.

## Phase 1: Security headers

| Header | Missing → finding |
|---|---|
| `strict-transport-security` | Missing HSTS |
| `content-security-policy` | Missing CSP |
| `x-frame-options` | Missing clickjacking protection |
| `x-content-type-options` | Missing nosniff |
| `referrer-policy` | Missing Referrer-Policy |
| `permissions-policy` | Missing Permissions-Policy |
| `cross-origin-opener-policy` | Missing COOP |
| `x-xss-protection` | Missing X-XSS-Protection |

Also reports `server` and `x-powered-by` headers and the present/total
security-header count.

## Phase 2: TLS inspection (https only)

Opens a raw TCP connection and performs an OpenSSL client handshake with
verification disabled (assessment, not trust validation):

- Certificate **subject** and **issuer**
- Certificate **expiry** (`not_after`)
- **Negotiated TLS version** (e.g. TLSv1.3) and **cipher**

## Phase 3: Injection probes

**Reflected XSS** — 4 payloads sent as `/?q=&lt;payload&gt;` with URL encoding;
if the response body contains the raw payload, a potential reflected XSS is
reported.

**Error-based SQLi** — 5 payloads sent as `/?id=&lt;payload&gt;`; the response is
scanned for 13 SQL error signatures:

```
SQL syntax · mysql_fetch · You have an error in your SQL syntax ·
Unclosed quotation mark · ORA- · PostgreSQL · SQLite · syntax error ·
Microsoft OLE DB · ODBC SQL Server Driver · unknown column ·
Warning: mysql_ · Division by zero
```

## Phase 4: Path discovery

33 common paths probed: `/robots.txt`, `/.git/config`, `/.env`,
`/.gitignore`, `/admin`, `/api`, `/swagger`, `/openapi.json`, `/graphql`,
`/backup`, `/wp-admin`, `/wp-login.php`, `/server-status`, `/actuator`,
`/actuator/health`, `/login`, `/register`, `/uploads/`, `/phpinfo.php`,
`/debug`, `/console`, `/trace`, `/metrics`, `/health`, `/version` and more.

Findings are reported with status code and content size; `401`/`403`/`500`
responses are flagged as *exists, protected*.

## Output

```
[*] ShadowScan 1.0.0 | target: http://192.168.1.10:8080
[*] timeout: 5s

[1/4] security headers
[2/4] TLS inspection
[3/4] injection probes (XSS / SQLi)
[4/4] path discovery

=== findings ===
  [header] Missing HSTS (HTTP Strict Transport Security)
  [header] server=nginx, x-powered-by=none (present 3/8 security headers)
  [xss] potential reflected XSS: http://192.168.1.10:8080/?q=%3Cscript%3Ealert(1)%3C/script%3E
  [path] 200 /robots.txt (size 1024)
  [path] 403 /admin (exists, protected)

[*] done: 5 findings
```

## Implementation notes

- HTTP via `ureq` (Agent with per-request timeout + custom UA)
- TLS via `openssl` (`SslConnector`, verify disabled for assessment)
- Header matching is case-insensitive
- First XSS/SQLi hit stops further probes (break on detection)
