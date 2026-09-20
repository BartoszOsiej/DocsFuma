---
description: All examples run on the current version — covered by 118 tests (`python3 -m unittest discover -s tests`).
keywords:
- Bartosz Osiej Docs
- Python
- Bash
- documentation
title: Examples
---
# Examples

All examples run on the current version — covered by 118 tests
(`python3 -m unittest discover -s tests`).

## Pokedex — the full language demo

`examples/pokedex.ext` shows classes with inheritance, comprehensions,
lambdas, exceptions, generators, f-strings and the standard library:

```python
import mathx
import strings

class Fire(Pokemon):
    def __init__(self, name, hp=50):
        Pokemon.__init__(self, name, ["fire"], hp)

# comprehensions
fire_team = [p.name for p in squad if p.is_type("fire")]

# lambda + kwargs
weakest = min(squad, key=lambda p: p.hp)

# try/except/finally
try:
    raise ValueError("psyduck is confused")
except ValueError as e:
    print("caught:", e)

# generator
nums = [f for f in fibonacci(10) if f % 2 == 0]

# stdlib
print(mathx.gcd(48, 36))        # 12
print(strings.slugify("Hello World!"))   # hello-world
```

Running it and a sample of the output:

```bash
externum run examples/pokedex.ext
```

```
=== Squad ===
Charmander (fire) — 39 HP
...
=== Fire types (comprehension) ===
['Charmander', 'Vulpix']
=== Weakest member (lambda) ===
Vulpix has only 38 HP!
=== Fib numbers (generator + ternary) ===
[0, 2, 8, 34]
=== Standard library ===
gcd(48, 36) = 12
slug: hello-world
palindrome: True
=== Counter (structs lib) ===
most common: ('a', 3)
```

## Hello world with binary numbers

`examples/hello.ext`:

```python
x = 0b1010
y = 42
print("Hello from Externum!")
print(x + y)      # 52
`ls -la`
%%
echo "Bash block"
%%
```

## Calculator

`examples/calc.ext`:

```python
running = 1
print("Calculator")

while running:
    a = int(input("a: "))
    b = int(input("b: "))
    print(a + b)
    print(a * b)
```

## Factorial — recursion

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(10))      # 3628800
```

## Classes with inheritance

```python
class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def speak(self):
        print("woof " + self.name)

Dog("Burek").speak()      # woof Burek
```

## Exceptions and `with`

```python
try:
    with open("/tmp/demo.txt", "w") as f:
        f.write("hello")
    data = open("/tmp/demo.txt", "r").read()
    print(data)
except IOError as e:
    print("io error", e)
```

## Modules

```python
import structs
import mathx

s = structs.Stack()
s.push(10)
s.push(20)
print(s.pop())            # 20
print(mathx.factorial(5)) # 120
```

## Compiling to Python

```bash
externum examples/hello.ext --target python -o hello.py
python3 hello.py
```
