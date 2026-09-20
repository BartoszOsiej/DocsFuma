---
description: Documentation for Architecture.
keywords:
- Bartosz Osiej Docs
- architecture
- compiler
- Python
- parser
- Bash
- AST
- documentation
title: Architecture
---
# Architecture

## Pipeline

```
source (.ext) → Lexer → tokens → Parser → AST → Compiler → python/bash/binary
                                                  ↘ Runtime (exec) / REPL
                                                     ↘ .ext module loader
```

## Stages

1. **Lexer** (`lexer.py`) — tokenization: **bracket-aware** INDENT/DEDENT
   (indentation inside `()[]{}` is ignored, blank lines do not break blocks),
   `0b`/`0x` literals, strings + f-strings + triple-quoted, the full operator
   set, inline bash (`` `...` ``) and blocks (`%% ... %%`).
2. **Parser** (`parser.py`) — recursive descent with operator precedence
   (matching Python), unary operators, ternary, lambdas, literals
   (lists/dicts/tuples/sets — including multi-line), indexing and slicing,
   attribute access, calls with kwargs/`*args`/`**args`, comprehensions,
   tuple unpacking and the full statement grammar: functions, classes with
   inheritance, `if/elif/else`, `while`, `for-in`, `try/except/else/finally`,
   `with`, `import`, `raise`, `assert`, `del`, `yield`, `global`, `nonlocal`.
3. **Compiler** (`compiler.py`) — code generation: to `python` (with
   `subprocess.run` for bash), `bash` (extracted commands) and `binary`
   (bit literals).
4. **Runtime** (`runtime/`) — in-process execution via `exec` of the
   generated Python; a **meta-path finder** compiles `.ext` modules on
   `import`; a REPL with block-completeness detection.

## Module system

`externum/runtime/__init__.py` registers `_ExtFinder` in `sys.meta_path`.
`import mod` finds `mod.ext` (or `pkg.mod.ext`) on the search path, compiles
it to Python and loads it as a module — the standard library in `lib/` is
written in Externum itself.

## Project structure

```
Externum/
├── externum/
│   ├── lexer.py          # Tokenization
│   ├── parser.py         # Full grammar → AST
│   ├── compiler.py       # Codegen (python/bash/binary)
│   ├── runtime/          # Runtime, .ext import, REPL
│   │   ├── llm/          # (roadmap)
│   │   ├── neural/       # (roadmap)
│   │   └── distributed/  # (roadmap)
│   └── __main__.py       # CLI (run / repl / compile)
├── lib/                  # Standard library (.ext)
│   ├── structs.ext       # Stack, Queue, Counter
│   ├── strings.ext       # reverse, slugify, is_palindrome, ...
│   ├── mathx.ext         # gcd, factorial, fib, ...
│   └── fs.ext            # read_file, write_file, ...
├── examples/             # hello.ext, calc.ext, pokedex.ext
├── tests/                # 118 unit tests
├── bin/externum          # CLI entry point
├── setup.py              # pip install -e .
└── WIKI.md               # Language specification
```

## API contract

`externum/__init__.py` exposes the core (`Lexer`, `Parser`, `Compiler`,
`Runtime`) plus **reserved** future modules: `llm` (LLMClient,
PromptTemplate, FunctionSchema), `neural` (Tensor, Module, Linear, Conv2d,
Attention, Autograd), `distributed` (Actor, Cluster, Stream, Channel),
`types` (DependentType, RefinementType, EffectType), `spec` (Spec, Theorem,
Proof, Verify) and `debug` (TimeTravelDebugger, HotReloader). The imports
are guarded — the package works without these modules.

## Roadmap

- [x] Full language: classes, exceptions, modules, lambdas, comprehensions, generators
- [x] REPL, module system, standard library, 118 tests
- [ ] `neural` module — tensors, autograd, layers (API contract in place)
- [ ] `llm` module — model integration (function calling)
- [ ] `distributed` module — actors and streams between processes
- [ ] Full `binary` target (assembler)
