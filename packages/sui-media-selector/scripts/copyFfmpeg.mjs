/* eslint-disable no-console */
import path from 'path';
import fse from 'fs-extra';
import glob from 'fast-glob';
import {typescriptCopy} from "../../../scripts/copyFilesUtils.mjs";

const packagePath = process.cwd();
const buildPath = path.join(packagePath, './build');

export async function copy( from, to ) {
  if (!(await fse.pathExists(to))) {
    console.warn(`path ${to} does not exists`);
    return [];
  }

  const files = await glob('**/*', { cwd: from });
  const cmds = files.map((file) => fse.copy(path.resolve(from, file), path.resolve(to, file)));
  return Promise.all(cmds);
}

async function run() {
  try {
    // TypeScript
    // mkdir -p ./public/lib/ffmpeg/core/dist && cp ./node_modules/@ffmpeg/core-mt/dist/esm/* ./public/lib/ffmpeg/core/dist && mkdir -p ./build/public/lib/ffmpeg/core/dist && cp ./public/lib/ffmpeg/core/dist/* ./build/public/lib/ffmpeg/core/dist
    const ffmpegPath = './public/lib/ffmpeg/core/dist';
    const ffmpegSource = './node_modules/@ffmpeg/core-mt/dist/esm/*';
    const publicFfmpeg = path.join(packagePath, ffmpegPath);
    const buildFfmpeg =  path.join(buildPath, ffmpegPath)
    if (!fse.existsSync(publicFfmpeg)) {
      await fse.mkdirp(publicFfmpeg);
    }
    if (!fse.existsSync(buildFfmpeg)) {
      await fse.mkdirp(buildFfmpeg);
    }
    await copy(ffmpegSource, publicFfmpeg);
    await copy(ffmpegSource, buildFfmpeg);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
