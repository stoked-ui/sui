import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getBranchCompareDetails,
  getCommitDetails,
} from '../../packages/sui-github/src/apiHandlers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotDir = path.resolve(__dirname, '../data/github/snapshots');

const snapshots = [
  {
    fileName: 'github-commit-private.json',
    load: () =>
      getCommitDetails({
        owner: 'stoked-ui',
        repo: 'sui',
        ref: '5c90b548a6a5af958d7aa31f78a794874c007886',
      }),
  },
  {
    fileName: 'github-branch-private.json',
    load: () =>
      getBranchCompareDetails({
        owner: 'stoked-ui',
        repo: 'sui',
        base: 'main',
        head: 'bug/fixAutoDeploySite',
      }),
  },
];

async function readIfExists(filePath: string) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function writeJson(filePath: string, value: unknown) {
  const nextValue = `${JSON.stringify(value, null, 2)}\n`;
  const existing = await readIfExists(filePath);

  if (existing === nextValue) {
    return false;
  }

  await writeFile(filePath, nextValue, 'utf8');
  return true;
}

async function main() {
  await mkdir(snapshotDir, { recursive: true });

  for (const snapshot of snapshots) {
    const filePath = path.join(snapshotDir, snapshot.fileName);

    try {
      const data = await snapshot.load();
      const updated = await writeJson(filePath, data);
      console.log(`${updated ? 'updated' : 'kept'} ${path.basename(filePath)}`);
    } catch (error) {
      const existing = await readIfExists(filePath);

      if (existing) {
        console.warn(
          `warning: failed to refresh ${snapshot.fileName}; keeping existing snapshot`,
          error,
        );
        continue;
      }

      throw error;
    }
  }
}

main().catch((error) => {
  console.error('Failed to generate GitHub snapshots', error);
  process.exitCode = 1;
});
