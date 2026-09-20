# Talus — Architecture (/docs/projects/talus-process-monitor/architecture)



# Talus — Architecture [#talus--architecture]

Internal architecture of Talus: the kernel-side eBPF
programs, the userspace event pipeline, the sliding-window alerting heuristic,
and the output layer.

***

## 1. System overview [#1-system-overview]

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KERNEL SPACE                                    │
│   syscall entry           eBPF tracepoint programs            map            │
│  ┌───────────┐   ┌──────────────────────────────────┐   ┌──────────────┐    │
│  │ execve    │──►│ process-monitor-ebpf             │──►│   EVENTS     │    │
│  │ openat    │   │  #[tracepoint] sys_enter_execve  │   │ PerfEventArray│   │
│  └───────────┘   │  #[tracepoint] sys_enter_openat  │   └──────┬───────┘    │
│                  └──────────────────────────────────┘          │ per-CPU    │
└─────────────────────────────────────────────────────────────────┼───────────┘
┌─────────────────────────────────────────────────────────────────▼───────────┐
│                             USERSPACE                                        │
│   reader thread ──► MPSC channel ──► Monitor (sliding window + alerting)     │
│                                            │                                │
│                            TUI │ JSON │ Plain │ Diagnose                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

Two crates form the workspace:

| Crate                  | Role                                                         | Toolchain                         |
| ---------------------- | ------------------------------------------------------------ | --------------------------------- |
| `process-monitor-ebpf` | Kernel-side tracepoint programs, `#![no_std]`, aya-ebpf      | Rust **nightly** (`-Z build-std`) |
| `process-monitor`      | Userspace: loader, reader thread, monitor core, output modes | Rust **stable**                   |

## 2. Kernel side — `process-monitor-ebpf` [#2-kernel-side--process-monitor-ebpf]

Both programs run in **tracepoint context** on syscall entry, before the kernel
copies arguments, so all userspace pointers are read with `bpf_probe_read_user`
— never dereferenced. This keeps the code verifier-safe.

The kernel and userspace agree on a fixed `#[repr(C)]` layout so records are
memcpy'd across the perf buffer without serialization:

```rust
pub struct ProcessEvent {
    pub event_type: u8,             // 0 = EXEC, 1 = OPEN
    pub pid: u32,
    pub uid: u32,
    pub comm: [u8; 16],             // process comm (truncated)
    pub filename: [u8; 64],         // target path (truncated)
}
```

An **85-byte payload** that occupies **92 bytes on the wire** — small and
fixed-size, which makes per-CPU perf buffering cheap (no allocation, no
variable-length encoding in kernel context).

## 3. Userspace — `process-monitor` [#3-userspace--process-monitor]

### Startup sequence (`Monitor::start`) [#startup-sequence-monitorstart]

1. **Privilege check** — bails unless `geteuid() == 0`.
2. **Object load** — `aya::Ebpf::load_file` parses the compiled eBPF object.
3. **Program load + attach** — each `TracePoint` program attaches to
   `syscalls/sys_enter_execve` / `sys_enter_openat`.
4. **Map hand-off** — the `EVENTS` `PerfEventArray` moves into the reader thread.
5. **Channel** — MPSC connects reader thread → monitor.

### Reader thread (`talus-reader`) [#reader-thread-talus-reader]

* Enumerates online CPUs, opens one `PerfEventArrayBuffer` per CPU.
* Decodes batches into pre-allocated `BytesMut` pools (zero per-event
  allocation in the hot loop).
* Counts `events.lost` (perf-buffer overruns) and forwards `Msg::Lost`.
* Idles 1 ms when no buffer has data — \~1 ms latency, near-zero idle CPU.

### Monitor core [#monitor-core]

```
stats:   HashMap<u32, ProcStats>          // pid → cumulative stats
windows: HashMap<u32, VecDeque<Instant>>  // pid → open timestamps (1 s window)
```

`handle_event` records stats, pushes `Open` timestamps onto the PID's sliding
window, evicts entries older than 1 s, and emits an `Alert` exactly when the
window crosses the configured threshold (`--alert-threshold`, `0` disables).

### Output layer [#output-layer]

`Monitor::poll` returns a `Vec&lt;Output&gt;` per tick (`Event` | `Alert`) routed by
mode: **TUI** (frankentui: 7-panel cyberpunk interface — events, process tree,
network, top files, extensions, alerts, heatmap) · **JSON** (NDJSON) · **Plain**
· **Diagnose** (verifies tracepoint IDs under `/sys/kernel/tracing/events`,
loads + attaches, listens 5 s, prints counters).

## 4. Data flow summary [#4-data-flow-summary]

```
kernel                 userspace reader            monitor core            output
──────────             ─────────────────          ─────────────            ──────
openat entry ──► EVENTS map ──► perf buffer ──► Msg::Event ──► sliding window ──► TUI / JSON / plain
                                 (per CPU)            │                │
                                                      └─ Msg::Lost ────► lost counter ──► status bar
                                                                        └─ Alert (threshold) ──► alerts panel
```

## 5. Performance characteristics [#5-performance-characteristics]

| Aspect           | Design                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Kernel overhead  | Two tracepoint programs; fixed-size record; no allocation          |
| Userspace decode | Pre-allocated `BytesMut` pools; zero per-event allocation          |
| Latency          | Events typically visible in \< 1 ms                                |
| Idle CPU         | Reader sleeps 1 ms when no buffers have data                       |
| Memory           | Sliding window evicts every poll; maps bounded by live PIDs        |
| Binary           | Full LTO + `strip = "symbols"` + `panic = "abort"` release profile |

## 6. Licensing subsystem [#6-licensing-subsystem]

The commercial licensing layer spans four components (full details in the
repo's [`ARCHITECTURE.md`](https://github.com/BartoszOsiej/talus-process-monitor/blob/master/ARCHITECTURE.md)
§8 and [`SECURITY.md`](https://github.com/BartoszOsiej/talus-process-monitor/blob/master/SECURITY.md)):

```
talus-keygen issue ──► signed key (Ed25519) ──► customer
                                                │
                                      talus license activate <KEY>
                                                ▼
            Cloudflare Worker + D1 (free tier) ── signature check,
            expiry, revocation, seat limits ──► activation token
```

| Component                             | Trust anchor                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `talus-keygen` (owner machine)        | Private key at `~/.secrets/talus/license-keys/` — never inside any repository                                             |
| Talus binary (`license.rs`)           | Embedded Ed25519 **public** key; compile-time XOR checksum detects binary tampering                                       |
| Activation server (`license-server/`) | Public key only; signature, expiry, revocation and seat checks in D1; rate limiting 5/5min per machine                    |
| Local cache                           | XOR-obfuscated (0600), re-verified against the signed key on every load — local edits to tier/expiry/features fail closed |

**Documented limit:** an attacker who fully controls the binary can patch
out license checks — signed keys protect the vendor's distribution channel,
not a modified client (see the repo SECURITY.md for the full trust model
and the key-rotation runbook).
