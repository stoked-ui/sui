const assert = require('node:assert/strict');

const { cleanOpenNextOutput } = require('./openNextOutputCleanup');

function createFsError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

describe('openNextOutputCleanup', () => {
  it('retries ENOTEMPTY failures until the output directory is removed', async () => {
    let exists = true;
    let rmCallCount = 0;
    const delays = [];
    const warnings = [];

    const result = await cleanOpenNextOutput(
      '/tmp/.open-next',
      {
        backoffFactor: 2,
        maxAttempts: 4,
        retryDelayMs: 10,
      },
      {
        fs: {
          existsSync: () => exists,
          rmSync: () => {
            rmCallCount += 1;

            if (rmCallCount < 3) {
              throw createFsError('ENOTEMPTY', 'Directory not empty');
            }

            exists = false;
          },
        },
        log: {
          warn: (message) => warnings.push(message),
        },
        sleep: async (delayMs) => {
          delays.push(delayMs);
        },
      },
    );

    assert.deepEqual(result, {
      attempts: 3,
      path: '/tmp/.open-next',
      removed: true,
    });
    assert.equal(rmCallCount, 3);
    assert.deepEqual(delays, [10, 20]);
    assert.equal(warnings.length, 2);
  });

  it('returns without removing anything when the output directory is already absent', async () => {
    let rmCalled = false;

    const result = await cleanOpenNextOutput('/tmp/.open-next', {}, {
      fs: {
        existsSync: () => false,
        rmSync: () => {
          rmCalled = true;
        },
      },
    });

    assert.deepEqual(result, {
      attempts: 0,
      path: '/tmp/.open-next',
      removed: false,
    });
    assert.equal(rmCalled, false);
  });

  it('throws non-retriable filesystem errors immediately', async () => {
    let rmCallCount = 0;
    let thrownError;

    try {
      await cleanOpenNextOutput('/tmp/.open-next', { maxAttempts: 4 }, {
        fs: {
          existsSync: () => true,
          rmSync: () => {
            rmCallCount += 1;
            throw createFsError('EACCES', 'Permission denied');
          },
        },
        sleep: async () => {},
      });
    } catch (error) {
      thrownError = error;
    }

    assert.ok(thrownError instanceof Error);
    assert.equal(thrownError.message, 'Permission denied');
    assert.equal(rmCallCount, 1);
  });
});
