/** 
 * Exported function to use editor metadata.
 * @module useEditorMetadata
 */
export { useEditorMetadata } from './useEditorMetadata';

/**
 * Type definitions for editor metadata hooks.
 * @typedef {Object} UseEditorMetadataSignature
 * @property {function} getEditorMetadata - Function to get editor metadata.
 * @typedef {Object} UseEditorMetadataParameters
 * @property {string} editorId - The unique identifier for the editor.
 * @property {string} userId - The unique identifier for the user.
 * @typedef {Object} UseEditorMetadataDefaultizedParameters
 * @property {string} editorId - The default editor identifier.
 * @property {string} userId - The default user identifier.
 */
export type {
  UseEditorMetadataSignature,
  UseEditorMetadataParameters,
  UseEditorMetadataDefaultizedParameters,
} from './useEditorMetadata.types';