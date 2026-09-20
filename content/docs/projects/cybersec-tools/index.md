---
description: 'CyberForge (repository: `BartoszOsiej/CyberForge`) contains four standalone CLI tools written in Rust. Each tool is deliberately focused,'
keywords:
- Bartosz Osiej Docs
- security
- Rust
- Bash
- documentation
title: CyberForge
---
# CyberForge

<a class="tests-cta" href="./tests">🧪 View animated test results — 29/29 →</a>

> **A Rust cybersecurity toolkit — four focused offensive-security tools built as a Cargo workspace, with zero external services and clean stdlib-heavy implementations.**

CyberForge (repository: `BartoszOsiej/CyberForge`) contains four
standalone CLI tools written in Rust. Each tool is deliberately focused,
single-purpose, and built to run anywhere Rust compiles — no daemons, no
databases, no cloud dependencies.

**Language:** Rust (2021 edition) · **Workspace:** Cargo workspace with 4
members · **Release profile:** `lto = true`, `opt-level = 3`, stripped symbols

## The four tools

| Tool | Purpose | Key capabilities |
|---|---|---|
| [NetRecon](/docs/projects/cybersec-tools/netrecon) | Concurrent TCP port scanner | CIDR expansion, hostname resolution, banner grabbing, JSON output, worker pool |
| [ShadowScan](/docs/projects/cybersec-tools/shadowscan) | Web vulnerability scanner | Security header audit, TLS/cert inspection, reflected XSS/SQLi probes, path discovery |
| [HashSleuth](/docs/projects/cybersec-tools/hashsleuth) | Hash identification & cracking | Fingerprinting of 15+ formats, parallel dictionary attack, masked brute force |
| [PacketEye](/docs/projects/cybersec-tools/packeteye) | pcap traffic analyzer | Live + offline capture, protocol mix, top talkers, TCP handshake stats |

## Why Rust

- **Memory safety** — no buffer overflows or use-after-free in security tools
- **Zero-runtime** — single static binaries, no interpreter required
- **Speed** — release builds with `lto` + `opt-level 3`
- **Portability** — the same binary runs on any Linux/macOS/Windows host

## Build

```bash
# Build all four tools (release)
cargo build --release

# Individual tools
cargo build --release -p netrecon
cargo build --release -p shadowscan
cargo build --release -p hashsleuth
cargo build --release -p packeteye

# Binaries land in target/release/
ls target/release/{netrecon,shadowscan,hashsleuth,packeteye}
```

**Dependencies:** `ureq` (HTTP client, ShadowScan), `openssl` (TLS,
ShadowScan), `md-5`/`sha1`/`sha2` (hashing, HashSleuth), `pcap` (capture,
PacketEye), `num_cpus` (parallelism). Everything else is stdlib.

## Legal & ethical use

These tools are intended for **authorized security testing only** — your own
systems, lab environments, or targets you have explicit written permission
to test. Unauthorized scanning, probing, or password cracking may violate
local laws and the terms of service of the systems involved. The author
accepts no responsibility for misuse.

## Repository layout

```
cybersec-tools/
├── Cargo.toml            # workspace definition + release profile
├── netrecon/
│   └── src/main.rs       # TCP scanner + banner grabber
├── shadowscan/
│   └── src/main.rs       # web vulnerability scanner
├── hashsleuth/
│   └── src/main.rs       # hash identify/dict/brute
└── packeteye/
    └── src/main.rs       # pcap analyzer
```
