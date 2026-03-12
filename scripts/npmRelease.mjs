import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const packageRoots = ['packages', 'packages-internal'];
const dependencyFields = ['dependencies', 'peerDependencies', 'optionalDependencies'];
const runtimeDependencyFields = ['dependencies', 'optionalDependencies'];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();
}

function runJson(command, args, fallback = null) {
  try {
    const output = run(command, args);
    return output ? JSON.parse(output) : fallback;
  } catch (error) {
    return fallback;
  }
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function findPackageFiles(dir) {
  const entries = await fs.readdir(path.join(rootDir, dir), { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await fs.readdir(path.join(rootDir, entryPath), { withFileTypes: true });
      for (const nestedEntry of nested) {
        if (nestedEntry.isFile() && nestedEntry.name === 'package.json') {
          results.push(path.join(entryPath, nestedEntry.name));
        }
      }
    }
  }

  return results;
}

async function getPublishablePackages() {
  const packageFiles = (await Promise.all(packageRoots.map(findPackageFiles))).flat();
  const packages = [];

  for (const relativeManifestPath of packageFiles) {
    const manifestPath = path.join(rootDir, relativeManifestPath);
    const manifest = await readJson(manifestPath);
    if (!manifest.name?.startsWith('@stoked-ui/') || manifest.private) {
      continue;
    }

    const dir = path.dirname(relativeManifestPath);
    const publishDirectory = manifest.publishConfig?.directory
      ? path.join(dir, manifest.publishConfig.directory)
      : dir;
    const publishManifestPath = path.join(rootDir, publishDirectory, 'package.json');
    const publishPath = (await exists(publishManifestPath)) ? publishDirectory : dir;

    packages.push({
      name: manifest.name,
      dir,
      manifestPath: relativeManifestPath,
      publishPath,
      publishManifestPath: path.join(publishPath, 'package.json'),
      manifest,
    });
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

function parseSimpleSemver(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function makePrereleaseVersion(baseVersion, preid, runNumber, runAttempt) {
  const { major, minor, patch } = parseSimpleSemver(baseVersion);
  return `${major}.${minor}.${patch}-${preid}.${runNumber}.${runAttempt}`;
}

function getChangedPackages(packages, base, head) {
  if (!base || /^0+$/.test(base)) {
    return packages.map((pkg) => pkg.name);
  }

  const changedFiles = run('git', ['diff', '--name-only', base, head])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const changed = new Set();
  for (const pkg of packages) {
    if (changedFiles.some((file) => file === pkg.manifestPath || file.startsWith(`${pkg.dir}/`))) {
      changed.add(pkg.name);
    }
  }
  return [...changed].sort();
}

async function getReleasePlan(planPath) {
  const fullPath = path.join(rootDir, planPath);
  if (!(await exists(fullPath))) {
    return {};
  }
  const plan = await readJson(fullPath);
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    throw new Error(`${planPath} must contain a JSON object mapping package names to versions`);
  }
  return plan;
}

function topoSortPackages(packagesByName, selectedNames) {
  const selected = new Set(selectedNames);
  const visiting = new Set();
  const visited = new Set();
  const ordered = [];

  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) return;
    visiting.add(name);
    const pkg = packagesByName.get(name);
    const deps = runtimeDependencyFields
      .flatMap((field) => Object.keys(pkg.manifest[field] || {}))
      .filter((dep) => selected.has(dep));
    deps.forEach(visit);
    visiting.delete(name);
    visited.add(name);
    ordered.push(name);
  }

  [...selected].sort().forEach(visit);
  return ordered;
}

function npmViewVersion(name, tag = 'latest') {
  const result = runJson('npm', ['view', `${name}@${tag}`, 'version', '--json'], null);
  if (!result) {
    return null;
  }
  return Array.isArray(result) ? result[result.length - 1] : result;
}

function validatePlan(packagesByName, plan) {
  for (const [name, version] of Object.entries(plan)) {
    if (!packagesByName.has(name)) {
      throw new Error(`release-plan.json references unknown package ${name}`);
    }
    parseSimpleSemver(version);
  }
}

async function patchManifestVersion(manifestPath, version, versionMap, packagesByName, { rewriteWorkspaceDeps = true } = {}) {
  const fullPath = path.join(rootDir, manifestPath);
  const manifest = await readJson(fullPath);
  manifest.version = version;

  if (rewriteWorkspaceDeps) {
    for (const field of dependencyFields) {
      if (!manifest[field]) continue;
      for (const [depName, depVersion] of Object.entries(manifest[field])) {
        if (!depVersion.startsWith('workspace:')) continue;
        const replacement = versionMap.get(depName) || npmViewVersion(depName);
        if (!replacement) {
          throw new Error(`Unable to resolve published version for workspace dependency ${depName} in ${manifestPath}`);
        }
        manifest[field][depName] = replacement;
      }
    }
  }

  await writeJson(fullPath, manifest);

  const pkg = packagesByName.get(manifest.name);
  if (pkg && manifestPath === pkg.manifestPath) {
    pkg.manifest = manifest;
  }
}

function appendGithubOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  require('node:fs').appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function detect() {
  const args = parseArgs(process.argv.slice(3));
  const base = args.base;
  const head = args.head || 'HEAD';
  const planPath = args.plan || 'release-plan.json';
  const packages = await getPublishablePackages();
  const packagesByName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const plan = await getReleasePlan(planPath);
  validatePlan(packagesByName, plan);
  const plannedPackages = Object.keys(plan).sort();
  const changedPackages = getChangedPackages(packages, base, head);
  const mode = plannedPackages.length > 0 ? 'release' : changedPackages.length > 0 ? 'prerelease' : 'none';

  const output = {
    mode,
    changedPackages,
    plannedPackages,
  };

  appendGithubOutput('mode', mode);
  appendGithubOutput('changed_packages', JSON.stringify(changedPackages));
  appendGithubOutput('planned_packages', JSON.stringify(plannedPackages));
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

async function publish() {
  const args = parseArgs(process.argv.slice(3));
  const mode = args.mode;
  const planPath = args.plan || 'release-plan.json';
  const preid = args.preid || 'alpha';
  const runNumber = args.runNumber || `${Date.now()}`;
  const runAttempt = args.runAttempt || '1';
  const packageNames = JSON.parse(args.packages || '[]');

  if (!['prerelease', 'release'].includes(mode)) {
    throw new Error(`Unsupported publish mode: ${mode}`);
  }

  const packages = await getPublishablePackages();
  const packagesByName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const plan = await getReleasePlan(planPath);
  validatePlan(packagesByName, plan);

  const selectedNames = mode === 'release' ? Object.keys(plan) : packageNames;
  if (selectedNames.length === 0) {
    console.log('No packages selected for publish.');
    return;
  }

  const orderedNames = topoSortPackages(packagesByName, selectedNames);
  const versionMap = new Map();
  const originalSourceManifests = new Map();
  for (const name of orderedNames) {
    const pkg = packagesByName.get(name);
    const version = mode === 'release'
      ? plan[name]
      : makePrereleaseVersion(pkg.manifest.version, preid, runNumber, runAttempt);
    versionMap.set(name, version);
    originalSourceManifests.set(name, structuredClone(pkg.manifest));
  }

  for (const name of orderedNames) {
    const pkg = packagesByName.get(name);
    const version = versionMap.get(name);
    await patchManifestVersion(pkg.publishManifestPath, version, versionMap, packagesByName);

    const publishArgs = ['publish', '--access', 'public', '--provenance'];
    if (mode === 'prerelease') {
      publishArgs.push('--tag', preid);
    }
    console.log(`Publishing ${name}@${version} from ${pkg.publishPath}`);
    execFileSync('npm', publishArgs, {
      cwd: path.join(rootDir, pkg.publishPath),
      stdio: 'inherit',
    });
  }

  if (mode === 'release') {
    for (const name of orderedNames) {
      const pkg = packagesByName.get(name);
      const restoredManifest = originalSourceManifests.get(name);
      restoredManifest.version = versionMap.get(name);
      await writeJson(path.join(rootDir, pkg.manifestPath), restoredManifest);
    }
    await writeJson(path.join(rootDir, planPath), {});
  }
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    result[key] = value;
  }
  return result;
}

async function main() {
  const command = process.argv[2];
  if (command === 'detect') {
    await detect();
    return;
  }
  if (command === 'publish') {
    await publish();
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
