import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Every `@stoked-ui/*` package that lives in this repository, keyed by package
 * name, mapped to the manifest that declares it.
 */
function collectWorkspacePackages() {
  const roots = ['packages', 'packages-internal'];
  const found = new Map();

  roots.forEach((root) => {
    const dir = path.join(workspaceRoot, root);
    if (!fs.existsSync(dir)) {
      return;
    }

    fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        const manifestPath = path.join(dir, entry.name, 'package.json');
        if (!fs.existsSync(manifestPath)) {
          return;
        }
        const manifest = readJson(manifestPath);
        if (manifest.name) {
          found.set(manifest.name, path.relative(workspaceRoot, manifestPath));
        }
      });
  });

  return found;
}

describe('workspace dependency integrity', () => {
  it('never resolves a first-party workspace package from the npm registry', () => {
    const workspacePackages = collectWorkspacePackages();
    assert.ok(
      workspacePackages.has('@stoked-ui/common'),
      'sanity check: @stoked-ui/common should be a workspace package',
    );

    const offenders = [];

    workspacePackages.forEach((manifestPath) => {
      const manifest = readJson(path.join(workspaceRoot, manifestPath));
      const deps = manifest.dependencies || {};

      Object.entries(deps).forEach(([name, range]) => {
        // Only first-party packages that actually exist in this workspace can be
        // — and therefore must be — linked rather than downloaded. A registry
        // range silently installs a second, stale copy of the package, which
        // then wins module resolution in the docs bundle and makes newer
        // exports (e.g. UserMenu) resolve to `undefined` at runtime.
        if (!workspacePackages.has(name)) {
          return;
        }
        if (!range.startsWith('workspace:')) {
          offenders.push(`${manifestPath}: "${name}": "${range}" (expected a workspace: range)`);
        }
      });
    });

    assert.deepStrictEqual(
      offenders,
      [],
      `first-party packages must be linked, not fetched from the registry:\n${offenders.join('\n')}`,
    );
  });

  it('builds workspace packages before deploying the site', () => {
    const workflowPath = path.join(workspaceRoot, '.github/workflows/deploy-site.yml');
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    const deployIndex = workflow.indexOf('sst deploy');
    assert.ok(deployIndex > -1, 'deploy-site.yml should run `sst deploy`');

    // Workspace links point at each package's `build/` directory, which is
    // gitignored. Unless CI builds the packages first those link targets do not
    // exist and module resolution silently falls through to whatever registry
    // copy happens to be installed.
    const buildMatch = /^\s*(?:-\s*)?(?:run:\s*)?.*(?:turbo run build|pnpm (?:-w )?(?:run )?build).*$/m.exec(
      workflow.slice(0, deployIndex),
    );

    assert.ok(
      buildMatch,
      'deploy-site.yml must build the workspace packages before `sst deploy`, otherwise the ' +
        '`link:../<pkg>/build` targets are missing in CI',
    );
  });
});
