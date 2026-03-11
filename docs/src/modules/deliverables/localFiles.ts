import fs from 'fs';
import path from 'path';

type LocalDeliverableFileOptions = {
  clientId: string;
  bundleId: string;
  filePath: string;
  cwd?: string;
};

type WriteLocalDeliverableFileOptions = LocalDeliverableFileOptions & {
  content: Buffer;
};

export function getLocalDeliverablesRoot(cwd = process.cwd()) {
  return path.join(cwd, '.local_deliverables');
}

export function getLocalDeliverablePath(options: LocalDeliverableFileOptions) {
  const { clientId, bundleId, filePath, cwd = process.cwd() } = options;
  return path.join(getLocalDeliverablesRoot(cwd), clientId, bundleId, filePath);
}

export function writeLocalDeliverableFile(options: WriteLocalDeliverableFileOptions) {
  const { content } = options;
  const localPath = getLocalDeliverablePath(options);

  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, content);

  return localPath;
}
