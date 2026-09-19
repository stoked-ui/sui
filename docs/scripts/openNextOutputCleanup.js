const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: sleep } = require('node:timers/promises');

const RETRIABLE_FS_CODES = new Set(['EBUSY', 'EMFILE', 'ENFILE', 'ENOTEMPTY', 'EPERM']);

const DEFAULT_OPTIONS = Object.freeze({
  maxAttempts: 8,
  retryDelayMs: 250,
  backoffFactor: 2,
});

function getOpenNextOutputPath(baseDir = process.cwd()) {
  return path.resolve(baseDir, '.open-next');
}

function isRetriableCleanupError(error) {
  return Boolean(error && typeof error === 'object' && RETRIABLE_FS_CODES.has(error.code));
}

function formatFailureMessage(targetPath, attempts, error) {
  const detail = error?.code ? `${error.code}: ${error.message}` : error?.message ?? String(error);

  return `[open-next-cleanup] Failed to remove ${targetPath} after ${attempts} attempts. ${detail}`;
}

async function cleanOpenNextOutput(targetPath = getOpenNextOutputPath(), options = {}, dependencies = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_OPTIONS.maxAttempts;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_OPTIONS.retryDelayMs;
  const backoffFactor = options.backoffFactor ?? DEFAULT_OPTIONS.backoffFactor;
  const fileSystem = dependencies.fs ?? fs;
  const sleepFor = dependencies.sleep ?? sleep;
  const log = dependencies.log ?? console;

  if (!fileSystem.existsSync(targetPath)) {
    return { attempts: 0, path: targetPath, removed: false };
  }

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      fileSystem.rmSync(targetPath, {
        force: true,
        maxRetries: 0,
        recursive: true,
      });

      if (!fileSystem.existsSync(targetPath)) {
        return { attempts: attempt, path: targetPath, removed: true };
      }

      lastError = new Error(
        `[open-next-cleanup] ${targetPath} still exists after rmSync completed on attempt ${attempt}.`,
      );
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return { attempts: attempt, path: targetPath, removed: true };
      }

      if (!isRetriableCleanupError(error)) {
        throw error;
      }

      lastError = error;
    }

    if (attempt === maxAttempts) {
      break;
    }

    const delayMs = retryDelayMs * Math.max(1, backoffFactor ** (attempt - 1));
    const reason = lastError?.code ?? 'EEXIST';

    log.warn(
      `[open-next-cleanup] Retry ${attempt}/${maxAttempts} removing ${targetPath} after ${reason}. Waiting ${delayMs}ms.`,
    );

    await sleepFor(delayMs);
  }

  lastError.message = formatFailureMessage(targetPath, maxAttempts, lastError);
  throw lastError;
}

async function runCli() {
  const result = await cleanOpenNextOutput();

  if (result.removed) {
    console.log(
      `[open-next-cleanup] Removed ${result.path}${result.attempts > 0 ? ` in ${result.attempts} attempt(s).` : '.'}`,
    );
    return;
  }

  console.log(`[open-next-cleanup] Nothing to remove at ${result.path}.`);
}

module.exports = {
  DEFAULT_OPTIONS,
  RETRIABLE_FS_CODES,
  cleanOpenNextOutput,
  getOpenNextOutputPath,
  isRetriableCleanupError,
};

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error?.stack ?? error?.message ?? error);
    process.exit(1);
  });
}
