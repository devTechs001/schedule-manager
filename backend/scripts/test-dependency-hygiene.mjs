/**
 * Dependency hygiene.
 *
 * The backend shipped with `import { GridFSBucket, ObjectId } from 'mongodb'`
 * while `mongodb` was only a transitive dependency of mongoose. Under npm's flat
 * node_modules that resolved fine, so nothing failed locally or in CI. Under
 * pnpm — which links only what you actually declare — it threw
 * ERR_MODULE_NOT_FOUND and took down every Render deploy, because the image
 * installs with `pnpm install --prod --frozen-lockfile`.
 *
 * Two lessons are encoded here:
 *
 *   1. A bare import must name a package that is declared in package.json.
 *      Relying on the resolver to flatten a transitive dependency is a latent
 *      deploy failure.
 *
 *   2. Resolution must be proven against a *production* install tree. A dev tree
 *      contains devDependencies and may be hoisted, so it hides the bug. If the
 *      caller has a pruned prod tree available it is checked too; the static
 *      check is what runs in CI where no such tree exists.
 *
 * Run: node --test scripts/test-dependency-hygiene.mjs
 *      PROD_TREE=/path/to/pruned/tree node --test scripts/test-dependency-hygiene.mjs
 *
 * The production tree is supplied via PROD_TREE. It has to be an environment
 * variable, not an argv flag: `node --test <file> --flag` does not forward the
 * flag to the test file, so an argv-based switch reads as "not set" and the
 * resolution check silently degrades to a no-op. PROD_TREE is deliberately not
 * documented in .env.example — it is test scaffolding, not something the
 * running application reads — and frontend/scripts/test-env-docs.mjs carries a
 * matching exemption.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules, createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.optionalDependencies ?? {}),
]);

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);

/** Every bare module specifier imported by a file under src/. */
const bareImports = () => {
  const found = new Map(); // package name -> Set of files
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(m?js|cjs)$/.test(full)) {
        // Strip comments first. A doc comment that mentions `from 'mongodb'`
        // while explaining why the import was removed must not be counted as
        // the import itself.
        const src = readFileSync(full, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:])\/\/.*$/gm, '$1');
        const re = /(?:from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"])/g;
        for (const m of src.matchAll(re)) {
          const spec = m[1] ?? m[2] ?? m[3] ?? m[4];
          if (!spec) continue;
          if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('#')) continue;
          if (spec.startsWith('node:') || builtins.has(spec)) continue;
          // 'mongodb' -> 'mongodb'; '@scope/pkg/sub' -> '@scope/pkg'
          const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
          if (!found.has(name)) found.set(name, new Set());
          found.get(name).add(relative(root, full));
        }
      }
    }
  };
  const srcDir = join(root, 'src');
  if (existsSync(srcDir)) walk(srcDir);
  return found;
};

const imports = bareImports();

test('src/ imports something, so the scan is not vacuous', () => {
  assert.ok(imports.size > 10, `expected many bare imports, found ${imports.size}`);
  assert.ok(imports.has('express'), 'express should be detected as an import');
});

test('every bare import names a declared dependency', () => {
  const undeclared = [...imports.entries()]
    .filter(([name]) => !declared.has(name))
    .map(([name, files]) => `${name} (imported by ${[...files].join(', ')})`);

  assert.deepEqual(
    undeclared,
    [],
    `undeclared imports will resolve in a dev tree but fail in a production ` +
      `install:\n  ${undeclared.join('\n  ')}`
  );
});

test('the gridfs storage module resolves through mongoose, not the driver', () => {
  const file = join(root, 'src/services/avatarStorage.js');
  if (!existsSync(file)) return; // module removed; nothing to assert
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  assert.ok(
    !/from\s+['"]mongodb['"]/.test(src),
    "avatarStorage must not import 'mongodb' directly — use mongoose.mongo / mongoose.Types, " +
      'which are the same objects and are guaranteed to be installed'
  );
  assert.ok(/mongoose\.mongo/.test(src), 'expected the GridFSBucket re-export to come from mongoose');
});

test('the declared dependency tree covers what the code imports at runtime', () => {
  // A dependency imported by production code must not live in devDependencies:
  // `pnpm install --prod` omits those, so the import would fail in the image.
  const prod = new Set(Object.keys(pkg.dependencies ?? {}));
  const devOnly = [...imports.keys()].filter(
    (name) => !prod.has(name) && Object.keys(pkg.devDependencies ?? {}).includes(name)
  );
  assert.deepEqual(devOnly, [], `production code imports dev-only packages: ${devOnly.join(', ')}`);
});

test('resolution is proven against a production install tree when one is given', () => {
  // PROD_TREE=<dir> runs this branch. It is the check that would have caught
  // the Render failure directly.
  const tree = process.env.PROD_TREE;
  if (!tree) {
    // Nothing to do in CI; the static assertions above already ran.
    assert.ok(true);
    return;
  }
  const requireFromTree = createRequire(join(tree, 'noop.js'));
  for (const name of imports.keys()) {
    if (!declared.has(name)) continue;
    if (!Object.keys(pkg.dependencies ?? {}).includes(name)) continue;
    const resolved = requireFromTree.resolve(name);
    assert.ok(isAbsolute(resolved), `${name} did not resolve from ${tree}`);
  }
});
