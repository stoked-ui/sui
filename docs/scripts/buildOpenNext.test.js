const assert = require('node:assert/strict');

const { main } = require('./buildOpenNext');

describe('buildOpenNext', () => {
  it('runs cleanup before the OpenNext build and prune-lambda', async () => {
    const steps = [];

    await main(['3.6.6'], {
      cleanOpenNextOutput: async () => {
        steps.push('clean');
      },
      log: {
        log: () => {},
      },
      runCommand: (command, args) => {
        steps.push([command, ...args].join(' '));
      },
    });

    assert.deepEqual(steps, [
      'clean',
      'npx --yes @opennextjs/aws@3.6.6 build',
      'pnpm prune-lambda',
    ]);
  });

  it('skips the OpenNext build when --clean-only is passed', async () => {
    const steps = [];

    await main(['3.6.6', '--clean-only'], {
      cleanOpenNextOutput: async () => {
        steps.push('clean');
      },
      log: {
        log: () => {},
      },
      runCommand: (command, args) => {
        steps.push([command, ...args].join(' '));
      },
    });

    assert.deepEqual(steps, ['clean']);
  });
});
