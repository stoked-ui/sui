// Copy every src/**/*.css into the built output so the per-component
// `import './X.css'` statements emitted by babel resolve in the published
// package. The babel build (scripts/build.mjs) only emits .js/.ts/.tsx and
// scripts/copyFiles.mjs only copies README/LICENSE/CHANGELOG, so CSS would
// otherwise be missing from `build/`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const srcDir = path.join(pkgRoot, 'src');
const buildDir = path.join(pkgRoot, 'build');

// Build sub-roots that mirror the src tree (stable/root ESM, modern ESM, node CJS).
const targetRoots = ['', 'modern', 'node']
  .map((sub) => path.join(buildDir, sub))
  .filter((dir) => fs.existsSync(dir));

function collectCss(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectCss(full));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
}

if (!fs.existsSync(srcDir)) {
  console.error('copy-css: src directory not found at', srcDir);
  process.exit(1);
}

const cssFiles = collectCss(srcDir);
let copied = 0;
for (const file of cssFiles) {
  const rel = path.relative(srcDir, file);
  for (const root of targetRoots) {
    const dest = path.join(root, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    copied += 1;
  }
}

console.log(`copy-css: copied ${cssFiles.length} css file(s) into ${targetRoots.length} build root(s) (${copied} writes).`);
