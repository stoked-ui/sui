const { spawnSync } = require('node:child_process');

const { cleanOpenNextOutput } = require('./openNextOutputCleanup');

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    env: process.env,
    shell: false,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }

  if (result.signal) {
    process.kill(process.pid, result.signal);
  }
}

async function main(argv = process.argv.slice(2), dependencies = {}) {
  const [openNextVersion, ...flags] = argv;
  const cleanOnly = flags.includes('--clean-only');
  const cleanOpenNextOutputImpl = dependencies.cleanOpenNextOutput ?? cleanOpenNextOutput;
  const log = dependencies.log ?? console;
  const runCommandImpl = dependencies.runCommand ?? runCommand;

  if (!openNextVersion) {
    throw new Error('Usage: node ./scripts/buildOpenNext.js <open-next-version> [--clean-only]');
  }

  log.log('[open-next-build] Pre-cleaning docs/.open-next before running OpenNext.');
  await cleanOpenNextOutputImpl();

  if (cleanOnly) {
    log.log('[open-next-build] Skipping OpenNext build because --clean-only was requested.');
    return;
  }

  runCommandImpl('npx', ['--yes', `@opennextjs/aws@${openNextVersion}`, 'build']);
  runCommandImpl('pnpm', ['prune-lambda']);
}

module.exports = {
  main,
  runCommand,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error?.stack ?? error?.message ?? error);
    process.exit(1);
  });
}
