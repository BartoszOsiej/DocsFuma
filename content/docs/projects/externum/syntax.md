---
description: Externum's syntax is indentation-based (like Python). A program is a sequence of statements; comments start with `#`. Blank lines and
keywords:
- Bartosz Osiej Docs
- Python
- documentation
title: Syntax Reference
---
# Syntax Reference

Externum's syntax is indentation-based (like Python). A program is a
sequence of statements; comments start with `#`. Blank lines and
comment-only lines do not affect indentation; indentation inside brackets is
ignored (as in Python).

## Types & literals

```python
name = "Externum"        # string
count = 42               # int
ratio = 3.14             # float
flag = True              # bool (True / False / None)

mask = 0b1010            # binary (= 10)
header = 0xFF            # hex (= 255)

s = """multi-line
string"""

data = [1, 2, 3]                     # list
d = {"a": 1, "b": 2}                 # dict
t = (1, 2)                           # tuple
st = {1, 2, 3}                       # set
matrix = [                           # multi-line literals work
    [1, 2],
    [3, 4],
]
```

## Assignments

```python
x = 42
x += 1
x *= 2
a, b = 1, 2              # tuple unpacking
d["k"] = "v"             # index assignment
obj.attr = 5             # attribute assignment
```

## Operators

| Category | Operators |
|---|---|
| Arithmetic | `+ - * / % // **` |
| Comparisons | `== != < > <= >=` plus `is`, `in` |
| Logical | `and or not` (`&& ||` also work) |
| Bitwise | `& \| ^ ~ << >>` |
| Assignment | `= += -= *= /= //= **= &= \|= ^= <<= >>=` |
| Other | ternary `a if cond else b` |

Precedence matches Python. Chained comparisons work: `0 < x &lt; 10`.

```python
x = 10 + 5 * 2            # 20
y = (10 + 5) * 2          # 30
z = 2 ** 8                # 256
ok = x > 5 and y < 100    # True
```

## Conditionals

```python
if x > 100:
    print("large")
elif x > 0:
    print("small positive")
else:
    print("non-positive")
```

## Loops

```python
i = 0
while i < 10:
    print(i)
    i += 1

for i in range(3):
    print(i)

for i, v in enumerate(["a", "b"]):   # multiple variables
    print(i, v)
```

## Functions

```python
def add(a, b):
    return a + b

def greet(name, greeting="hi", *args, **kwargs):
    print(greeting, name)

def factorial(n: Int) -> Int:        # type annotations are optional
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# lambdas
square = lambda x: x * x

# closures
def make_adder(n):
    def adder(x):
        return x + n
    return adder

# generators
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

## Classes

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print("... from " + self.name)

class Dog(Animal):                   # inheritance
    def speak(self):
        print("woof " + self.name)
```

## Exceptions

```python
try:
    x = 1 / 0
except ZeroDivisionError as e:
    print("caught", e)
except:
    print("other")
else:
    print("no error")
finally:
    print("done")

raise ValueError("boom")
assert x > 0
```

## Modules & standard library

```python
import mathx
import strings
from structs import Stack

import os                            # Python's stdlib also works
```

## Comprehensions

```python
evens = [i for i in range(10) if i % 2 == 0]
caps = {n: n.upper() for n in names}
```

## Strings & f-strings

```python
msg = "Hello, " + "world!"
print(f"value: {msg}")
print("ab" * 3)
print(s.strip().replace("a", "x").split(","))   # method chaining
```

## Interpolated strings ($"...")

Native string interpolation — expressions inside `{...}` are evaluated
and concatenated at runtime. Works in both execution targets (Python
transpiler and bytecode VM) with identical semantics, and `{{` / `}}`
render as literal braces, exactly like Python f-strings:

```python
name = "world"
print($"Hello {name}!")            # Hello world!
print($"{a} + {b} = {a + b}")      # expressions are evaluated
print($"literal braces: {{x}}")    # literal braces: {x}
```

## Bash integration

### Inline bash (backticks)

```python
`ls -la | grep ".py"`
```

### Bash blocks (`%% ... %%`)

```python
%%
#!/bin/bash
for file in *.py; do
    echo "Processing $file"
done
%%
```

## Built-in calls

`print`, `input`, `len`, `str`, `int`, `float`, `bool`, `list`, `dict`,
`tuple`, `set`, `range`, `open`, `type`, `sum`, `min`, `max`, `abs`,
`round`, `enumerate`, `zip`, `sorted`, `reversed`, `chr`, `ord`, `hex`,
`oct`, `bin`, `isinstance`, `repr`, `format`.
