#!/usr/bin/env python3
"""
Codemod: neutralise dynamic Tailwind colour interpolation.

`className={`bg-${color}-500`}` cannot work. Tailwind scans source files for
literal class strings at build time; a template literal produces nothing, so the
element silently renders unstyled. It is the most common "why is this component
invisible?" bug in this codebase (24 files).

There is no safe automatic rewrite that keeps the colour semantics, because the
set of possible values is only known at runtime. What we can do is stop shipping
code that *looks* like it sets a colour but doesn't:

  `text-${x.color}-500`  ->  `text-content`            (a token that exists)
  `bg-${x.color}-100`    ->  `bg-surface-sunken`
  `border-${x.color}-500`->  `border-line`
  `ring-${x.color}-500`  ->  `ring-line`

Anything ambiguous is reported so it can be fixed by hand with an explicit map.
"""
import re
import sys
from pathlib import Path

# Ordered: longest suffix first.
REPLACEMENTS = [
    (r'(?:dark:)?bg-\$\{[^}]+\}-9\d\d(?:/\d+)?', 'bg-surface-sunken'),
    (r'(?:dark:)?bg-\$\{[^}]+\}-[1-8]\d\d(?:/\d+)?', 'bg-surface-sunken'),
    (r'(?:dark:)?text-\$\{[^}]+\}-[1-9]\d\d', 'text-content-muted'),
    (r'(?:dark:)?border-\$\{[^}]+\}-[1-9]\d\d', 'border-line'),
    (r'(?:dark:)?ring-\$\{[^}]+\}-[1-9]\d\d', 'ring-line'),
    (r'(?:dark:)?from-\$\{[^}]+\}-[1-9]\d\d', 'from-primary-500'),
    (r'(?:dark:)?to-\$\{[^}]+\}-[1-9]\d\d', 'to-secondary-500'),
]

# `bg-${x}-500` etc. where the suffix is a bare number we did not catch.
LEFTOVER = re.compile(r'\b(?:dark:)?(?:bg|text|border|ring|from|to|via)-\$\{[^}]+\}-[^\s`"\',]+')


def migrate(text: str):
    out = text
    for pattern, replacement in REPLACEMENTS:
        out = re.sub(pattern, replacement, out)
    # Collapse `bg-surface-sunken bg-surface-sunken`
    out = re.sub(r'\b(bg-surface-sunken)\s+\1\b', r'\1', out)
    return out


def main(paths):
    changed = 0
    leftovers = []
    for raw in paths:
        path = Path(raw)
        original = path.read_text()
        migrated = migrate(original)
        if migrated != original:
            path.write_text(migrated)
            changed += 1
        for match in LEFTOVER.findall(migrated):
            leftovers.append((str(path), match))

    print(f'{changed} file(s) rewritten')
    if leftovers:
        print(f'\n{len(leftovers)} dynamic class(es) still need a hand-written map:')
        seen = set()
        for file, match in leftovers:
            key = (file, match)
            if key in seen:
                continue
            seen.add(key)
            print(f'  {file}: {match}')
    else:
        print('no dynamic colour interpolation left')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
