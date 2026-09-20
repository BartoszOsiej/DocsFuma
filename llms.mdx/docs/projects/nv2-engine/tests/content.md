# Tests (/docs/projects/nv2-engine/tests)



# Tests — NV2 Engine [#tests--nv2-engine]

Full automated test results for **NV2 Engine*&#x2A;, collected during the QA sweep
on 2026-08-13 (Linux, Rust 1.97, Node 22, Python 3). Scroll down — the
counters count up, the bars fill in and every row animates as it enters the
viewport. Use **▶ Replay animation** to run it again.

<TestSuiteView project="nv2-engine" lang="en" />

## Reproduce [#reproduce]

```bash
cd Core
cargo test
cargo test --release qa_benchmark_report -- --ignored --nocapture
```
