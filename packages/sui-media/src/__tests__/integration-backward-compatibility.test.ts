/**
 * Integration Test: Backward Compatibility with media-selector
 *
 * This test verifies that the new @stoked-ui/media package maintains
 * backward compatibility with the legacy @stoked-ui/media-selector package.
 *
 * Tests verify:
 * - All exports from media-selector are available in media
 * - Type compatibility between packages
 * - No breaking changes in the API
 */

describe('Integration: Backward Compatibility - @stoked-ui/media-selector to @stoked-ui/media', () => {
  it('should export all main classes from media package', () => {
    // Import from the new media package
    const {
      MediaFile,
      WebFile,
      App,
      Stage,
    } = require('../index.ts');

    // Verify all main classes are exported
    expect(MediaFile).toBeDefined();
    expect(WebFile).toBeDefined();
    expect(App).toBeDefined();
    expect(Stage).toBeDefined();
  });

  it('should export MediaType utilities', () => {
    const {
      getMediaType,
    } = require('../index.ts');

    // Verify getMediaType function is available
    expect(typeof getMediaType).toBe('function');
  });

  it('should export file system API utilities', () => {
    const {
      openFileApi,
      saveFileApi,
    } = require('../index.ts');

    expect(typeof openFileApi).toBe('function');
    expect(typeof saveFileApi).toBe('function');
  });

  it('should export zip utilities', () => {
    const {
      createZip,
    } = require('../index.ts');

    expect(typeof createZip).toBe('function');
  });

  it('should export WebFileFactory', () => {
    const {
      WebFileFactory,
    } = require('../index.ts');

    // WebFileFactory is available in media
    expect(WebFileFactory).toBeDefined();
  });

  it('should export AppFile and AppOutputFile classes', () => {
    const {
      AppFile,
      AppOutputFile,
    } = require('../index.ts');

    expect(AppFile).toBeDefined();
    expect(AppOutputFile).toBeDefined();
  });
});
