---
description: Documentation for 🧪 pqguard — Test Results.
keywords:
- Bartosz Osiej Docs
- ML-KEM-768
- Bash
- documentation
title: 🧪 pqguard — Test Results
---
# 🧪 pqguard — Test Results

> **12/12 tests passing** ✅

## Test suite

| # | Test | Status |
|---|------|--------|
| 1 | keygen creates keypair | ✅ |
| 2 | public key format valid | ✅ |
| 3 | private key format valid | ✅ |
| 4 | encrypt produces pqguard file | ✅ |
| 5 | decrypt recovers plaintext | ✅ |
| 6 | wrong key fails decryption | ✅ |
| 7 | verify detects valid file | ✅ |
| 8 | verify detects corrupted file | ✅ |
| 9 | info shows key metadata | ✅ |
| 10 | encrypt/decrypt roundtrip | ✅ |
| 11 | large file handling (1MB) | ✅ |
| 12 | ML-KEM-768 compliance | ✅ |

## Running tests

```bash
cargo test --workspace
```

## CI

Tests run on every push via GitHub Actions across Linux, macOS, and Windows.
