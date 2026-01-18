import MediaFile from './MediaFile';
import Stage from './Stage';
import WebFile from './WebFile';
import App from './App';

// Deprecation warning
if (typeof console !== 'undefined' && console.warn) {
  console.warn(
    '[DEPRECATION WARNING] @stoked-ui/media-selector is deprecated and will no longer receive updates. ' +
    'Please migrate to @stoked-ui/media for ongoing support and new features. ' +
    'See the migration guide: https://github.com/stoked-ui/sui/blob/main/packages/sui-media-selector/MIGRATION_GUIDE.md'
  );
}

export { App, MediaFile, WebFile, Stage };
export * from './App';
export * from './WebFile';
export * from './MediaType';
export * from './MediaFile';
export * from './zip';
