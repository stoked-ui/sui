/** 
 * Module exporting useEditor hook for editor functionality
 */
export { useEditor } from './useEditor';

/** 
 * Module exporting EditorProvider component for editor context provider
 */
export { EditorProvider } from './EditorProvider';

/** 
 * Type definitions for editor plugins and public API
 */
export type {
  EditorPlugin,
  EditorPluginSignature,
  ConvertPluginsIntoSignatures,
  MergeSignaturesProperty,
  EditorPublicAPI,
  EditorExperimentalFeatures,
} from './models';

/** 
 * Type definition for editor core plugin parameters
 */
export type { EditorCorePluginParameters } from './corePlugins';

/** 
 * Module exporting useEditorMetadata hook for editor metadata management
 */
export { useEditorMetadata } from './plugins/useEditorMetadata';

/** 
 * Type definitions for useEditorMetadata hook signature and parameters
 */
export type {
  UseEditorMetadataSignature,
  UseEditorMetadataParameters,
} from './plugins/useEditorMetadata';

/** 
 * Module exporting buildWarning function for generating warning messages
 */
export { buildWarning } from './utils/warning';