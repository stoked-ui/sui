import sinon from 'sinon';
import { unstable_resetCleanupTracking as unstable_resetCleanupTrackingFileExplorer } from '@stoked-ui/file-explorer';

export default function createXMochaHooks(coreMochaHooks = {}) {
  const mochaHooks = {
    beforeAll: [...(coreMochaHooks.beforeAll ?? [])],
    afterAll: [...(coreMochaHooks.afterAll ?? [])],
    beforeEach: [...(coreMochaHooks.beforeEach ?? [])],
    afterEach: [...(coreMochaHooks.afterEach ?? [])],
  };


  mochaHooks.beforeAll.push(function func() {
  });

  mochaHooks.beforeEach.push(function setupLicenseKey() {
  });

  mochaHooks.afterEach.push(function resetCleanupTracking() {
    unstable_resetCleanupTrackingFileExplorer();

    // Restore Sinon default sandbox to avoid memory leak
    // See https://github.com/sinonjs/sinon/issues/1866
    sinon.restore();
  });

  return mochaHooks;
}
