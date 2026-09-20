---
sidebar_label: Tests
title: Tests
description: Full animated test results for Novactorio.
keywords:
- Bartosz Osiej Docs
- Python
- Rust
- Bash
- documentation
---
# Tests — Novactorio

Full automated test results for **Novactorio**, collected during the QA sweep
on 2026-08-13 (Linux, Rust 1.97, Node 22, Python 3). Scroll down — the
counters count up, the bars fill in and every row animates as it enters the
viewport. Use **▶ Replay animation** to run it again.

<TestSuiteView project="factorio-web-game" lang="en" />

## Reproduce

```bash
npm run typecheck
npm run build
npm run lint
```
