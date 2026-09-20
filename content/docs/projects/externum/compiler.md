---
description: Documentation for Compiler & CLI.
keywords:
- Bartosz Osiej Docs
- compiler
- Python
- Bash
- documentation
title: Compiler & CLI
---
# Compiler & CLI

## Commands

```bash
externum run <file.ext> [args...]   # run a program
externum repl                       # interactive shell
externum compile <file.ext>         # compile (default command)
```

## Compilation

```bash
externum program.ext                      # --target all (default)
externum program.ext --target python      # Python only
externum program.ext --target bash        # Bash only
externum program.ext --target binary      # binary variant only
externum program.ext -o output.py         # write to a file
```

### Targets

| Target | Description |
|---|---|
| `python` | Executable Python code — statements, classes, functions, `subprocess.run` for bash |
| `bash` | Extracted shell commands and blocks |
| `binary` | Binary literals (`0b...`) as bit strings |
| `all` | All three, combined into one report |

## Execution

```bash
externum run program.ext arg1 arg2
```

The runtime transpiles the source to Python and executes it in-process.
Arguments reach the program's `sys.argv` (`argv[0]` = script path).

## REPL

```bash
externum repl
```

- Interactive shell with auto-print of expression results
- Multi-line blocks (continue after `:`, an empty line ends the block)
- `import` and the whole standard library are available
- Exit: `exit()` or `Ctrl+D`

## Other options

| Option | Description |
|---|---|
| `--version` | `Externum 3.0.0` |
| `-h, --help` | Help |
| `-o, --output &lt;file&gt;` | Write the result to a file |

## Module search path

`import module` looks for `module.ext` in order:

1. the script's directory,
2. the current directory,
3. the `lib/` directory of the Externum repository,
4. paths from `EXTERNUM_PATH` (separated by `:`).

## Exit codes

| Code | Meaning |
|---|---|
| `1` | File does not exist / I/O error |
| `1` | Syntax error (`Syntax Error`) |
| `1` | Runtime error (`Runtime Error`) |
