#!/usr/bin/env python3
"""
Codemod: migrate legacy gray-* utility pairs onto the design-token palette.

The orphaned components predate the token system. They use
`bg-white dark:bg-gray-800` style pairs, which ignore the app's themed
`--surface` / `--content` / `--line` variables — so in the non-default themes
(midnight, nord, sand) they render as the wrong colour entirely.

Strategy: replace the *pair* first (that is where the semantic intent lives),
then mop up any remaining singletons. Anything ambiguous is reported, not
guessed at.
"""
import re
import sys
from pathlib import Path

# Ordered: longest / most specific pairs first.
PAIRS = [
    # surfaces
    (r'\bbg-white\s+dark:bg-gray-8\d\d\b', 'bg-surface'),
    (r'\bbg-white\s+dark:bg-gray-9\d\d\b', 'bg-surface'),
    (r'\bbg-gray-50\s+dark:bg-gray-8\d\d\b', 'bg-surface-sunken'),
    (r'\bbg-gray-50\s+dark:bg-gray-9\d\d\b', 'bg-surface-sunken'),
    (r'\bbg-gray-100\s+dark:bg-gray-8\d\d\b', 'bg-surface-sunken'),
    (r'\bbg-gray-100\s+dark:bg-gray-7\d\d\b', 'bg-surface-sunken'),
    (r'\bbg-gray-200\s+dark:bg-gray-7\d\d\b', 'bg-surface-sunken'),
    # text
    (r'\btext-gray-900\s+dark:text-white\b', 'text-content'),
    (r'\btext-gray-900\s+dark:text-gray-100\b', 'text-content'),
    (r'\btext-gray-800\s+dark:text-white\b', 'text-content'),
    (r'\btext-gray-800\s+dark:text-gray-200\b', 'text-content'),
    (r'\btext-gray-700\s+dark:text-gray-300\b', 'text-content'),
    (r'\btext-gray-700\s+dark:text-gray-200\b', 'text-content'),
    (r'\btext-gray-600\s+dark:text-gray-400\b', 'text-content-muted'),
    (r'\btext-gray-600\s+dark:text-gray-300\b', 'text-content-muted'),
    (r'\btext-gray-500\s+dark:text-gray-400\b', 'text-content-muted'),
    (r'\btext-gray-500\s+dark:text-gray-500\b', 'text-content-subtle'),
    (r'\btext-gray-400\s+dark:text-gray-500\b', 'text-content-subtle'),
    (r'\btext-gray-400\s+dark:text-gray-400\b', 'text-content-subtle'),
    # borders
    (r'\bborder-gray-200\s+dark:border-gray-700\b', 'border-line'),
    (r'\bborder-gray-200\s+dark:border-gray-600\b', 'border-line'),
    (r'\bborder-gray-300\s+dark:border-gray-600\b', 'border-line'),
    (r'\bborder-gray-300\s+dark:border-gray-700\b', 'border-line'),
    (r'\bborder-gray-100\s+dark:border-gray-800\b', 'border-line'),
    (r'\bborder-gray-700\s+dark:border-gray-600\b', 'border-line'),
    # divide
    (r'\bdivide-gray-200\s+dark:divide-gray-700\b', 'divide-line'),
    (r'\bdivide-gray-100\s+dark:divide-gray-800\b', 'divide-line'),
    # hover pairs
    (r'\bhover:bg-gray-100\s+dark:hover:bg-gray-7\d\d\b', 'hover:bg-surface-sunken'),
    (r'\bhover:bg-gray-50\s+dark:hover:bg-gray-8\d\d\b', 'hover:bg-surface-sunken'),
    (r'\bhover:bg-gray-50\s+dark:hover:bg-gray-7\d\d\b', 'hover:bg-surface-sunken'),
    (r'\bhover:bg-gray-200\s+dark:hover:bg-gray-7\d\d\b', 'hover:bg-surface-sunken'),
    (r'\bhover:text-gray-900\s+dark:hover:text-white\b', 'hover:text-content'),
]

# Singletons after pairs are gone. These are unambiguous.
SINGLES = [
    (r'\bbg-white\b(?!\s*dark:)', 'bg-surface'),
    (r'\btext-gray-900\b', 'text-content'),
    (r'\btext-gray-800\b', 'text-content'),
    (r'\btext-gray-700\b', 'text-content'),
    (r'\btext-gray-600\b', 'text-content-muted'),
    (r'\btext-gray-500\b', 'text-content-muted'),
    (r'\btext-gray-400\b', 'text-content-subtle'),
    (r'\btext-gray-300\b', 'text-content-subtle'),
    (r'\bborder-gray-200\b', 'border-line'),
    (r'\bborder-gray-300\b', 'border-line'),
    (r'\bbg-gray-50\b', 'bg-surface-sunken'),
    (r'\bbg-gray-100\b', 'bg-surface-sunken'),
]


def migrate(source: str):
    text = source
    for pattern, replacement in PAIRS:
        text = re.sub(pattern, replacement, text)
    for pattern, replacement in SINGLES:
        text = re.sub(pattern, replacement, text)
    # Collapse duplicated utilities the substitution can produce.
    text = re.sub(r'\b(bg-surface)\s+\1\b', r'\1', text)
    text = re.sub(r'\b(text-content)\s+\1\b', r'\1', text)
    text = re.sub(r'\b(border-line)\s+\1\b', r'\1', text)
    return text


def main(paths):
    changed, skipped = 0, 0
    for raw in paths:
        path = Path(raw)
        original = path.read_text()
        migrated = migrate(original)

        # Never leave a dangling `dark:` variant with no base utility.
        leftovers = re.findall(r'\b(?:text|bg|border|divide)-gray-\d{2,3}\b', migrated)
        if migrated != original:
            path.write_text(migrated)
            changed += 1
            status = 'rewritten'
        else:
            skipped += 1
            status = 'unchanged'
        if leftovers:
            print(f'  ! {path}: {len(leftovers)} gray-* left ({sorted(set(leftovers))[:5]})', file=sys.stderr)
        else:
            print(f'  · {path}: {status}')
    print(f'\n{changed} rewritten, {skipped} unchanged')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
