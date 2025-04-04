/**
 * @module exports
 * @description Exports the EditorFile class.
 */

import EditorFile from './EditorFile';

/**
 * @class EditorFile
 * @extends {EditorBase}
 * @description The EditorFile class represents a file in the editor.
 *
 * @property {string} id - The unique identifier of the file.
 * @property {string} name - The name of the file.
 * @property {string[]} content - The content of the file.
 */

export default EditorFile;
export * from './EditorFile';