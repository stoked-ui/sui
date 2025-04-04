/**
 * @module exports
 * @description Exports the EditorEngine module, including its components and types.
 */

import EditorEngine from './EditorEngine';

/**
 * @class EditorEngine
 * @extends {Object}
 * @description The main application engine for the editor.
 * 
 * @property {Object} [types] - Type definitions for the editor.
 */
export default EditorEngine;

export * from './EditorEngine';
export * from './EditorEngine.types';
export * from './events';