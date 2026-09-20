---
sidebar_label: Tests
title: Tests
description: Full animated test results for LinkShort.
keywords:
- Bartosz Osiej Docs
- Python
- Rust
- Bash
- AST
- documentation
---
# Tests — LinkShort

Full automated test results for **LinkShort**, collected during the QA sweep
on 2026-08-13 (Linux, Rust 1.97, Node 22, Python 3). Scroll down — the
counters count up, the bars fill in and every row animates as it enters the
viewport. Use **▶ Replay animation** to run it again.

<TestSuiteView project="fastapi-url" lang="en" />

## Reproduce

```bash
python3.9 -m venv venv && venv/bin/pip install -r requirements.txt
venv/bin/python -m pytest tests/ -v
```
