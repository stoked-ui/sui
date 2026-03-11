import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import { getLocalDeliverablePath, writeLocalDeliverableFile } from './localFiles';

describe('localFiles', () => {
  it('creates nested directories for deliverable assets', () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'deliverables-local-files-'));

    try {
      const localPath = writeLocalDeliverableFile({
        cwd,
        clientId: '69aec3f879c754449aee27af',
        bundleId: 'xferall-platform-engineering-2026-q1',
        filePath: 'index_files/webpack.js',
        content: Buffer.from('console.log("ok");'),
      });

      expect(localPath).to.equal(getLocalDeliverablePath({
        cwd,
        clientId: '69aec3f879c754449aee27af',
        bundleId: 'xferall-platform-engineering-2026-q1',
        filePath: 'index_files/webpack.js',
      }));
      expect(fs.existsSync(localPath)).to.equal(true);
      expect(fs.readFileSync(localPath, 'utf8')).to.equal('console.log("ok");');
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });
});
