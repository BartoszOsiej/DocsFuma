---
sidebar_label: Tests
title: Tests
description: Full animated test results for Talus.
keywords:
- Bartosz Osiej Docs
- Python
- Rust
- Bash
- documentation
---
# Tests — Talus

Full automated test results for **Talus**, collected during the QA sweep
on 2026-09-17 (Linux, Rust 1.97, Node 22, Python 3). Scroll down — the
counters count up, the bars fill in and every row animates as it enters the
viewport. Use **▶ Replay animation** to run it again.

The suite covers the monitor core, the Ed25519 licensing module, the MeMLP
detection engine, the tamper-evident audit log and the sandbox. On top of
the unit tests, the licensing flow is verified end-to-end against the
production activation server — 18/18 HTTP scenarios (activation,
idempotent re-activation, seat limits, expiry, revocation, rate limiting,
binary E2E with the real `talus` binary); see
[TEST_REPORT_SECURE_LICENSING.md](https://github.com/BartoszOsiej/talus-process-monitor/blob/master/TEST_REPORT_SECURE_LICENSING.md).

<TestSuiteView project="talus-process-monitor" lang="en" />

## Reproduce

```bash
cargo test
```
