---
description: '**Post-quantum file encryption CLI** — ML-KEM-768 (FIPS 203) + AES-256-GCM. Encrypt files using NIST-standardized post-quantum algorithms that resist both'
keywords:
- Bartosz Osiej Docs
- post-quantum cryptography
- cryptography
- architecture
- encryption
- AES-256-GCM
- ML-KEM-768
- Rust
- documentation
title: 🔒 pqguard
---
# 🔒 pqguard

<a class="tests-cta" href="./tests">🧪 View test results →</a>

**Post-quantum file encryption CLI** — ML-KEM-768 (FIPS 203) + AES-256-GCM.

Encrypt files using NIST-standardized post-quantum algorithms that resist both
classical and quantum computer attacks.

> **Project status:** production-quality Rust cryptography, NIST FIPS 203 compliant,
> fuzz-tested, published on crates.io.

---

## 🎯 What it does

| Capability | Description |
|---|---|
| **Post-quantum key exchange** | ML-KEM-768 (Kyber768) — NIST Level 3, resists Shor's algorithm |
| **Hybrid encryption** | KEM + HKDF-SHA256 + AES-256-GCM — industry-standard symmetric layer |
| **CLI interface** | `keygen`, `encrypt`, `decrypt`, `verify`, `info` commands |
| **Key management** | Named keypairs with public/private separation |
| **File verification** | Integrity check without decryption |
| **NIST compliance** | FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA) |

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────────┐
│  ENCRYPTION                                         │
│                                                     │
│  1. Generate random salt + nonce                    │
│  2. ML-KEM-768 encapsulate → shared secret + ct     │
│  3. HKDF-SHA256(shared_secret, salt) → aes_key     │
│  4. AES-256-GCM(aes_key, nonce, plaintext) → ct    │
│  5. Write: PQGR ‖ version ‖ kem_ct ‖ nonce ‖      │
│            salt ‖ aes_ct                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  DECRYPTION                                         │
│                                                     │
│  1. Parse PQGR envelope                             │
│  2. ML-KEM-768 decapsulate(ct, dk) → shared_secret  │
│  3. HKDF-SHA256(shared_secret, salt) → aes_key     │
│  4. AES-256-GCM decrypt(aes_key, nonce, aes_ct)     │
│  5. Output plaintext                                │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick start

```bash
# Install
cargo install pqguard

# Generate keypair
pqguard keygen

# Encrypt a file
pqguard encrypt secret.txt --recipient public_key.pqg.pub

# Multi-recipient — any listed private key can decrypt
pqguard encrypt secret.txt -r alice.pqg.pub -r bob.pqg.pub

# Decrypt
pqguard decrypt secret.pqg --private-key private_key.pqg.key
```

## 📖 Commands

| Command | Description |
|---|---|
| `pqguard keygen` | Generate ML-KEM-768 keypair |
| `pqguard encrypt <file> -r <pubkey>` | Encrypt file for one recipient |
| `pqguard encrypt <file> -r <a> -r <b>` | Multi-recipient (v2 envelope) |
| `pqguard decrypt <file> -k <privkey>` | Decrypt file with private key |
| `pqguard verify <file>` | Verify pqguard file integrity |
| `pqguard info <keyfile>` | Show key information |

## 🔐 Algorithm Details

| Component | Algorithm | Standard |
|---|---|---|
| Key Exchange | ML-KEM-768 (Kyber768) | NIST FIPS 203 |
| Key Derivation | HKDF-SHA256 | RFC 5869 |
| Symmetric Encryption | AES-256-GCM | NIST SP 800-38D |

## 📊 Benchmarks

| Operation | Time |
|---|---|
| Keygen | ~150μs |
| Encapsulate | ~25μs |
| Decapsulate | ~30μs |
| AES-256-GCM (1MB) | ~0.5ms |

## 🧪 Why Post-Quantum?

Classical cryptography (RSA, ECDH) will be broken by quantum computers running
Shor's algorithm. NIST finalized post-quantum standards in 2024:

- **ML-KEM** (FIPS 203) — Key encapsulation
- **ML-DSA** (FIPS 204) — Digital signatures
- **SLH-DSA** (FIPS 205) — Hash-based signatures

The "harvest now, decrypt later" threat means data encrypted today with classical
algorithms can be decrypted by future quantum computers. **pqguard** protects against this.

## 🔗 Links

- [GitHub](https://github.com/BartoszOsiej/pqguard)
- [crates.io](https://crates.io/crates/pqguard)
- [Landing page](https://bartoszosiej.github.io/quantum-shield/)
