---
sidebar_label: Tests
title: Tests
description: Full animated test results for NV2 Engine.
keywords:
- Bartosz Osiej Docs
- benchmark
- Python
- Rust
- Bash
- documentation
---
# Tests — NV2 Engine

Full automated test results for **NV2 Engine**, collected during the QA sweep
on 2026-08-13 (Linux, Rust 1.97, Node 22, Python 3). Scroll down — the
counters count up, the bars fill in and every row animates as it enters the
viewport. Use **▶ Replay animation** to run it again.

<TestSuiteView project="nv2-engine" lang="en" />

## Reproduce

```bash
cd Core
cargo test
cargo test --release qa_benchmark_report -- --ignored --nocapture
```
