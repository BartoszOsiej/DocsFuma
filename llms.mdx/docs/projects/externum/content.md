# 📜 Externum (/docs/projects/externum)



# 📜 Externum [#-externum]

<a class="tests-cta" href="./tests">🧪 View animated test results — 120/120 →</a>

**Externum v3.0 "Sentient"** — a fully functional programming language of
our own that fuses Python's readability, binary performance and Bash's
system control into one paradigm.

> `Externum = Python_readability ⊕ Binary_performance ⊕ Bash_control`

One source file (`.ext`) compiles **to three targets at once**: Python,
Bash and a binary representation — and the `run` mode executes the program
directly. There is also a **REPL**, a **module system** and its own
**standard library** written in Externum itself.

## ✨ What it can do [#-what-it-can-do]

| Area             | Support                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Data types**   | lists, dicts, tuples, sets (including multi-line), f-strings, `0b`/`0x` literals                                      |
| **Control flow** | `if/elif/else`, `while`, `for ... in` (multi-variable), `break/continue`, `try/except/else/finally`, `with`, `assert` |
| **Functions**    | default parameters, `*args`/`**kwargs`, recursion, **lambdas**, closures, **generators** (`yield`)                    |
| **OOP**          | classes, **inheritance**, methods, `self`                                                                             |
| **Modules**      | `import`, own `.ext` modules, standard library                                                                        |
| **Expressions**  | full operator precedence, bitwise `& \| ^ ~ << >>`, **ternary**, **comprehensions**                                   |
| **Shell**        | inline bash `` `cmd` `` and `%% ... %%` blocks                                                                        |
| **Tooling**      | REPL, 3 compile targets, `argv`                                                                                       |

## 🚀 Quick start [#-quick-start]

```bash
git clone https://github.com/BartoszOsiej/externum.git
cd Externum
pip install -e .            # Python 3.10+

externum --version          # Externum 3.0.0

# Run a program
externum run examples/pokedex.ext

# Interactive shell
externum repl
```

## 🕹️ Try it live [#️-try-it-live]

The playground below executes Externum **entirely in your browser*&#x2A; — the
transpiler (written in Python) runs through WebAssembly (Pyodide), with no
server at all. Click **▶ Run** and watch the program execute:

<ExternumPlayground />

## 📚 Standard library (in Externum) [#-standard-library-in-externum]

| Module    | Contents                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| `structs` | `Stack`, `Queue`, `Counter`                                                   |
| `strings` | `reverse`, `is_palindrome`, `slugify`, `word_count`, `capitalize`, `truncate` |
| `mathx`   | `clamp`, `is_even`, `gcd`, `fib`, `factorial`, `sum_of_digits`                |
| `fs`      | `read_file`, `write_file`, `append_file`, `file_exists`, `list_dir`           |

## 🗺️ Documentation [#️-documentation]

* [Syntax](/docs/projects/externum/syntax) — the complete language guide
* [Examples](/docs/projects/externum/examples) — working programs with output
* [Compiler & CLI](/docs/projects/externum/compiler) — targets and options
* [Architecture](/docs/projects/externum/architecture) — pipeline, modules, roadmap
