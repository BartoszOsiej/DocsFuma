# Tests (/docs/projects/aurora-os/tests)



# Tests — Aurora [#tests--aurora]

Full automated test results for **Aurora*&#x2A;, collected during the QA sweep
on 2026-08-13 (Linux, Rust 1.97, Node 22, Python 3). Scroll down — the
counters count up, the bars fill in and every row animates as it enters the
viewport. Use **▶ Replay animation** to run it again.

<TestSuiteView project="aurora-os" lang="en" />

## Reproduce [#reproduce]

```bash
npm test
npx tsc -p tsconfig.json --noEmit
```
