# 🛰️ Talus (/docs/projects/talus-process-monitor)



# 🛰️ Talus [#️-talus]

<a class="tests-cta" href="./tests">🧪 View animated test results — 95/95 →</a>

**eBPF endpoint security agent for Linux — detect ransomware behaviour, respond at the kernel edge.**

Talus traces `execve`, `openat`, `connect`, `accept`, `sendto` and `recvfrom`
syscalls at the kernel level using eBPF tracepoints, streams events into
userspace through per-CPU perf buffers, and surfaces them in a live terminal
FrankenTUI — while continuously scoring per-process file-open rates against
a sliding window to flag ransomware-style mass file access, and automatically
`SIGKILL`-ing offending processes.

> **Project status:** production-quality Rust + eBPF engineering showcase,
> shipped with a commercial licensing system — Ed25519-signed keys and a
> live activation backend on Cloudflare Workers + D1 (free tier).

***

## 🎯 What it does [#-what-it-does]

| Capability                    | Description                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| **Kernel-level tracing**      | `execve` and `openat` tracepoints attached on every online CPU                              |
| **Verifier-safe kernel code** | Userspace pointers read exclusively via `bpf_probe_read_user` — never dereferenced          |
| **Zero-copy event pipeline**  | Fixed-size `ProcessEvent` records streamed through per-CPU `PerfEventArray` buffers         |
| **Live FrankenTUI**           | 7-panel cyberpunk interface: events, processes, network, files, extensions, alerts, heatmap |
| **Sliding-window heuristic**  | 1-second rolling window per PID; alerts when a process exceeds the configured open rate     |
| **Multiple output modes**     | Human TUI, newline-delimited JSON, plain text log, and a built-in self-diagnostic           |
| **Lost-event accounting**     | Perf-buffer overruns are counted and reported, never silently dropped                       |
| **Single static binary**      | Full LTO, `panic = "abort"`, symbol-stripped release profile                                |

## ⚙️ Architecture [#️-architecture]

Kernel-side eBPF programs capture every `execve`/`openat` into a compact
`ProcessEvent` record pushed into a `PerfEventArray`. A dedicated userspace
reader thread opens one perf buffer per CPU, decodes events, and forwards
them over an MPSC channel to the monitor core, which feeds a 1-second sliding
window per PID and emits alerts when the threshold is crossed.

```
execve/openat ─► eBPF tracepoints ─► EVENTS (PerfEventArray)
                                        │  per-CPU perf buffers
                    reader thread ◄─────┘
                        │  MPSC channel
                   monitor core (sliding window + alerting)
                        │
              TUI / JSON / plain / diagnose
```

See the [full architecture](/docs/projects/talus-process-monitor/architecture) for the complete design.

## 🚀 Quick start [#-quick-start]

```bash
# Distro-aware installer (apt, dnf, pacman, zypper, apk, xbps)
./install.sh                       # user-local install to ~/.local
./install.sh --system              # system-wide install to /usr/local

# Or build manually
./build.sh
sudo target/release/process-monitor
```

## 🖥️ Usage [#️-usage]

```bash
sudo process-monitor                    # TUI (default when stdout is a terminal)
sudo process-monitor --alert-threshold 100   # raise alert threshold (opens/s)
sudo process-monitor --json | jq .      # machine-readable NDJSON
sudo process-monitor --plain            # plain text log
sudo process-monitor --diagnose         # 5-second end-to-end self-diagnostic
```

**TUI keys:** `q` / `Esc` / `Ctrl+C` quit · `p` pause/resume · `c` clear log ·
`↑/↓`/`j/k` scroll · `PgUp`/`PgDn` faster · `Home`/`End` jump.

## 🛡️ The ransomware heuristic [#️-the-ransomware-heuristic]

> **For every PID, keep a 1-second sliding window of `openat` calls. If the
> window contains ≥ N opens (default 50), emit an alert.**

* Sliding window, not a rate counter — bursts are caught as reliably as steady streams
* Per-process isolation — no cross-process false positives
* `--alert-threshold 0` disables the heuristic entirely

## ◆ Licensing & Editions [#-licensing--editions]

Talus ships in two editions. **Community** is free and MIT-licensed; the
**Enterprise** features (auto-kill, web dashboard, Kafka, ClickHouse,
MemGraph, C FFI) are unlocked by a paid license key.

| Layer                 | Implementation                                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Signed keys**       | `base64(payload).base64(Ed25519 signature)` — the binary embeds the *public* key only; the signing key never leaves the owner's machine                                                                              |
| **Activation server** | Cloudflare Worker + D1 (free tier) at `talus-license-server.metaforicmail.workers.dev` — verifies signatures server-side, enforces expiry, revocation and seat limits, rate-limits to 5 attempts / 5 min per machine |
| **Seat control**      | Authoritative in D1 (`max_seats`); moving a machine is `deactivate` → `activate`; re-activation of the same machine is idempotent                                                                                    |
| **Client hardening**  | Local cache re-verified against the signed key on every load (fail-closed), SHA-256 trial integrity tag, downgrade protection, 30-day offline grace                                                                  |
| **Trial**             | 30-day Enterprise trial on first run                                                                                                                                                                                 |

```bash
talus license activate <KEY>   # activate online (one key = one machine)
talus license show             # tier, expiry, seats, features
```

Pricing **amounts** are set per sale and never published in the repos —
see [`docs/pricing-tiers.md`](https://github.com/BartoszOsiej/talus-process-monitor/blob/master/docs/pricing-tiers.md)
for the structure and [`docs/EULA.txt`](https://github.com/BartoszOsiej/talus-process-monitor/blob/master/docs/EULA.txt)
for the license terms.

## 📦 Project layout [#-project-layout]

```
talus-process-monitor/
├── process-monitor/          # Userspace: monitor core + TUI + web + FFI + licensing
│   └── src/
│       ├── main.rs           # CLI, mode selection, signal handling
│       ├── monitor.rs        # eBPF loading, perf reader, sliding-window tracker
│       ├── license.rs        # Ed25519 license verification, activation, feature gating
│       ├── audit.rs          # Tamper-evident hash-chain audit log
│       └── tui.rs            # 7-panel frankentui (ftui) cyberpunk interface
├── process-monitor-ebpf/     # Kernel side (#![no_std], aya-ebpf)
│   └── src/main.rs           # tracepoint hooks → PerfEventArray
├── license-keygen/           # Owner-only keygen CLI (keys live outside the repo)
├── license-server/           # Cloudflare Worker + D1 activation backend
├── scripts/                  # issue / revoke / list-activations / health-check
├── build.sh                  # Build script (nightly for eBPF, stable for TUI)
├── install.sh                # Distro-aware installer / uninstaller
└── ARCHITECTURE.md           # Full design document (incl. licensing subsystem)
```

## 🔧 Requirements [#-requirements]

* Linux kernel &#x2A;*5.8+** (eBPF + tracepoint support)
* **root** (`CAP_BPF` / `CAP_SYS_ADMIN`) to load and attach eBPF programs
* Rust **nightly** + `rust-src` for the eBPF crate; **stable** for userspace
* `bpf-linker`, `clang`, C compiler; BTF (`/sys/kernel/btf/vmlinux`) recommended
