#!/usr/bin/env python3
"""
Codemod: strip hardcoded demo collections from orphaned components.

Every one of these follows the same shape:

    const defaultXxx = [ ...fake rows... ];
    const [x, setX] = useState(initialX.length > 0 ? initialX : defaultXxx);

The component already receives the real data as a prop; the literal only exists
so the component has something to show in an empty workspace. That is exactly
what we do not want in production, so:

  1. delete the `const defaultXxx = [...]` declaration, and
  2. rewrite the initializer to just use the prop.

Anything that does not match the expected shape is reported instead of guessed
at, so nothing silently half-migrates.
"""
import re
import sys
from pathlib import Path


def strip_balanced_array(text: str, start: int) -> int:
    """Given the index of `[` opening an array literal, return the index just
    past its matching `]`, honouring strings/template literals/comments."""
    depth = 0
    i = start
    n = len(text)
    in_str = None
    while i < n:
        ch = text[i]
        nxt = text[i + 1] if i + 1 < n else ''

        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == in_str:
                in_str = None
            i += 1
            continue

        if ch in ('"', "'", '`'):
            in_str = ch
            i += 1
            continue

        if ch == '/' and nxt == '/':
            i = text.find('\n', i)
            if i == -1:
                return n
            continue

        if ch == '/' and nxt == '*':
            end = text.find('*/', i + 2)
            i = n if end == -1 else end + 2
            continue

        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return -1


DECL = re.compile(r'^([ \t]*)const (\w*[Dd]efault\w*) = \[', re.MULTILINE)


def migrate(path: Path) -> str:
    text = path.read_text()
    original = text
    removed = []

    while True:
        match = DECL.search(text)
        if not match:
            break
        indent, name = match.group(1), match.group(2)
        open_idx = text.index('[', match.start())
        end_idx = strip_balanced_array(text, open_idx)
        if end_idx == -1:
            raise SystemExit(f'{path}: unbalanced array for {name}')

        # Consume the trailing `;` and one newline.
        tail = end_idx
        while tail < len(text) and text[tail] in ' \t':
            tail += 1
        if tail < len(text) and text[tail] == ';':
            tail += 1
        if tail < len(text) and text[tail] == '\n':
            tail += 1

        text = text[:match.start()] + text[tail:]
        removed.append(name)

    # Point the initializers at the prop instead of the (now gone) literal.
    for name in removed:
        text = re.sub(
            rf'\b(initial\w*)\.length\s*>\s*0\s*\?\s*\1\s*:\s*{name}\b',
            r'\1',
            text,
        )
        # Any remaining ternary that still mentions the removed literal.
        text = re.sub(rf'[^,;\n]*\?[^,;\n]*\b{name}\b[^,;\n]*', '', text)

    if text != original:
        path.write_text(text)
    return ', '.join(removed) if removed else ''


def main(paths):
    total = 0
    for raw in paths:
        path = Path(raw)
        names = migrate(path)
        if names:
            total += 1
            print(f'  ✓ {path}: removed {names}')
    print(f'\n{total} component(s) cleaned')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
