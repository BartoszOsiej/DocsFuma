---
description: Concurrent TCP port scanner with banner grabbing — the network discovery workhorse of the toolkit.
keywords:
- Bartosz Osiej Docs
- networking
- Bash
- documentation
title: NetRecon
---
# NetRecon

Concurrent TCP port scanner with banner grabbing — the network discovery
workhorse of the toolkit.

## Overview

NetRecon probes TCP ports across a target using a **fixed worker pool with
atomic work-stealing**. Each probe performs a timed connect plus an optional
banner read. Results are printed as they are found and can be emitted as
JSON-lines for pipeline integration.

**Key design points:**

- Fixed worker pool (default 128 threads) with a shared `Mutex&lt;VecDeque&gt;`
  work queue
- `TcpStream::connect_timeout` — no OS-level connect hangs
- Deterministic service-name mapping for 50+ well-known ports
- Best-effort banner grab: sends a bare `\r\n`, reads up to 200 bytes of the
  reply (works for HTTP, SMTP, FTP, SSH, and more)

## Usage

```
netrecon <target> [ports] [--threads N] [--timeout MS] [--json]

ARGUMENTS:
  target   IP address, hostname, or CIDR (e.g. 10.0.0.0/24)
  ports    comma list and/or ranges (default 1-1024)

OPTIONS:
  --threads N   worker threads (default 128)
  --timeout MS  connect timeout ms (default 1000)
  --top N       scan the N most common ports (nmap-style preset)
  --json        JSON-lines output (includes detected product)
```

Banner-based product detection is built in: HTTP `Server:` headers,
SSH-2.0 implementation strings, and SMTP/FTP greetings are parsed and
reported for every open port (plain table and `--json`).

### Examples

```bash
# Scan localhost for common services
netrecon 127.0.0.1 22,80,443

# Scan a /24 subnet's top ports with 64 threads
netrecon 192.168.1.0/24 1-1024 --threads 64

# Quick sweep: the 50 most common ports with product detection
netrecon 10.0.0.7 --top 50

# Hostname resolution
netrecon example.com 80,443

# JSON output for jq pipelines
netrecon 10.0.0.5 22,80,443,3306 --json | jq .
```

## Target expansion

| Input | Expansion |
|---|---|
| Single IP | `127.0.0.1` → one address |
| Hostname | `example.com` → resolved via `ToSocketAddrs` (all returned addresses) |
| CIDR | `10.0.0.0/24` → 256 addresses |
| CIDR guard | `/0`–`/7` refused (more than 16M hosts is impractical) |
| IPv6 | Not supported for CIDR (explicit error) |

## Port parsing

Ports accept comma-separated lists and `lo-hi` ranges:

```
22,80,443          → 22, 80, 443
1-1024             → 1..=1024
22,80,8000-8100    → mixed list and range
```

## Banner grabbing

After a successful connect, NetRecon:

1. Sets read timeout (1.5 s) and write timeout (500 ms)
2. Sends a generic `\r\n` probe
3. Reads up to 512 bytes, keeps the first 200 as UTF-8 (lossy), trims
4. Reports the banner alongside the service name

## Output

**Human-readable:**
```
10.0.0.5:22     ssh              OpenSSH_9.2p1 Debian-2+deb12u1
10.0.0.5:80     http
10.0.0.5:443    https
```

**JSON-lines** (`--json`):
```json
{"addr":"10.0.0.5","port":22,"service":"ssh","banner":"OpenSSH_9.2p1"}
```

## Service map (selection)

`ftp` (20/21) · `ssh` (22) · `smtp` (25) · `dns` (53) · `http` (80) ·
`pop3` (110) · `msrpc` (135) · `netbios-ssn` (139) · `imap` (143) ·
`snmp` (161/162) · `ldap` (389) · `https` (443) · `microsoft-ds` (445) ·
`mysql` (3306) · `rdp` (3389) · `postgresql` (5432) · `redis` (6379) ·
`kubernetes` (6443) · `mongodb` (27017) and 40+ more.

## Implementation notes

- `parse_cidr` guards against shift overflow and OOM for huge prefixes
- Results are sorted by (address, port) before printing
- The banner field escapes `"` for safe JSON embedding
