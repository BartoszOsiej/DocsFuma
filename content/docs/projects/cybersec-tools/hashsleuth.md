---
description: Hash identification + password cracking toolkit with three modes.
keywords:
- Bartosz Osiej Docs
- documentation
title: HashSleuth
---
# HashSleuth

Hash identification + password cracking toolkit with three modes.

## Overview

HashSleuth fingerprints hash formats and attacks them with two strategies:
a parallel **dictionary attack** and a masked **brute force**. It supports
MD5, SHA1, and SHA256 digest cracking with auto-detection from hash length.

## Usage

```
hashsleuth identify <hash>
hashsleuth dict <hash> <wordlist> [--algo md5|sha1|sha256]
hashsleuth brute <hash> <charset> <maxlen> [--algo md5|sha1|sha256]

EXAMPLES:
  hashsleuth identify 5f4dcc3b5aa765d61d8327deb882cf99
  hashsleuth dict 5f4dcc3b5aa765d61d8327deb882cf99 rockyou.txt
  hashsleuth brute 5f4dcc3b5aa765d61d8327deb882cf99 abc123 5 --algo md5
```

## Mode 1: identify

Fingerprints a hash from its **encoding and length**. Recognized formats:

| Format | Detection |
|---|---|
| bcrypt | `$2a$` / `$2b$` / `$2y$` prefix |
| sha256-crypt | `$5$` prefix |
| sha512-crypt | `$6$` prefix |
| md5-crypt | `$1$` prefix |
| Apache MD5 | `$apr1$` prefix |
| phpass (WordPress/Drupal) | `$P$` / `$H$` prefix |
| LDAP SHA1 / SSHA | `{sha1}` / `{ssha}` prefix |
| Django PBKDF2 | `pbkdf2:sha256:` prefix |
| Django salted SHA | `sha1$` / `sha256$` prefix |

**Hex digests by length:**

| Length | Candidates |
|---|---|
| 8 | CRC16 / FNV (hex) |
| 16 | CRC32 / NTLM (hex) |
| 32 | MD5 · NTLM (hex MD4) · MySQL323 |
| 40 | SHA1 · MySQL5 |
| 56 | SHA224 |
| 64 | SHA256 · RIPEMD-160 (hex) |
| 96 | SHA384 |
| 128 | SHA512 |

```
$ hashsleuth identify 5f4dcc3b5aa765d61d8327deb882cf99
[*] hash: 5f4dcc3b5aa765d61d8327deb882cf99
[?] possible: MD5
[?] possible: NTLM (hex MD4)
[?] possible: MySQL323
```

## Mode 2: dict (dictionary attack)

Reads a wordlist line-by-line and hashes each candidate across a worker pool
(`num_cpus`, capped at 32). Early exit: the first match sets an atomic flag
that stops all workers.

```
$ hashsleuth dict 482c811da5d5b4bc6d497ffa98491e38 /tmp/wl.txt --algo md5
[+] FOUND: password123
[*] cracked in 0.00s
```

- Auto-detects the algorithm from hash length when `--algo` is omitted
- Reports total words tried and elapsed time on failure

## Mode 3: brute (masked brute force)

Enumerates every combination of a charset up to `maxlen`:

```
$ hashsleuth brute 900150983cd24fb0d6963f7d28e17f72 abc 3 --algo md5
[*] HashSleuth 1.0.0 | brute force | algo=md5 | charset="abc" | maxlen=3
[*] target: 900150983cd24fb0d6963f7d28e17f72
[+] FOUND: abc
```

**Parallelization:** workers stride the flat index space (`i = w; i += workers`)
across every position and length; each worker decodes its index into charset
digits (base-N counter).

**Search-space guard:** if `charset^len > 100,000,000` the tool aborts that
length with a clear message instead of exhausting CPU.

```
$ hashsleuth brute 5f4dcc3b5aa765d61d8327deb882cf99 abcdefghijklmnopqrstuvwxyz 8 --algo md5
[-] search space too large (26^8 = 208B); aborting
```

> **Note:** brute force grows exponentially — with a 26-character charset the
> 100M search-space cap is already exceeded at length 6 (26⁶ = 308M), so the
> practical limit is ~5 characters. Prefer a good wordlist (dictionary mode).

## Algorithm auto-detection

When `--algo` is omitted, the hash length selects the algorithm:

| Length | Algorithm |
|---|---|
| 32 | md5 |
| 40 | sha1 |
| 64 | sha256 |
| other | error, `--algo` required |

## Implementation notes

- `identify()` checks prefixes before hex-length classification
- Dictionary mode uses a sliding window of worker threads (max `num_cpus`)
- Brute force uses `checked_pow` to avoid integer overflow
- All workers share an `AtomicBool` for early termination
