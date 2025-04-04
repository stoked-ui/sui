/**
 * Exported controllers module.
 *
 * @module Controllers
 */

import Controllers from './Controllers';

/**
 * Exports the Controllers object, making it available for import in other modules.
 */
export default Controllers;

/*
/**
 * Exports the AnimationController as a named export, allowing for specific imports.
 *
 * @example
 * import { AnimationController } from './AnimationController';
 */
export { default as AnimationController } from './AnimationController';

/**
 * Exports the AudioController as a named export.
 *
 * @example
 * import { AudioController } from './AudioController';
 */
export { default as AudioController } from './AudioController';

/**
 * Exports the ImageController as a named export.
 *
 * @example
 * import { ImageController } from './ImageController';
 */
export { default as ImageController } from './ImageController';

/**
 * Exports the VideoController as a named export.
 *
 * @example
 * import { VideoController } from './VideoController';
 */
export { default as VideoController } from './VideoController';

/*
/**
 * Exports all exports from the AnimationController module, allowing for wildcard imports.
 *
 * @example
 * import * from './AnimationController';
 */
export * from './AudioController';
export * from './ImageController';
export * from './VideoController';