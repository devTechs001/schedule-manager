// Ask Vite to transform every source module — any import/export error surfaces here
import { createServer } from 'vite';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const walk = (dir, acc = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(jsx?|css)$/.test(entry)) acc.push(p);
  }
  return acc;
};

const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error' });
const files = walk('./src').filter((f) => !f.includes('service-worker'));
let failed = 0;
for (const file of files) {
  try {
    await server.transformRequest(file.replace('./', '/'));
  } catch (error) {
    failed += 1;
    console.log(`✗ ${file}: ${String(error.message).split('\n')[0].slice(0, 160)}`);
  }
}
console.log(`\nModule check: ${files.length - failed}/${files.length} modules transformed`);
await server.close();
process.exitCode = failed ? 1 : 0;
