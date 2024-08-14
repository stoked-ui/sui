export { useVideoEditor } from './useVideoEditor';
export { VideoEditorProvider } from './VideoEditorProvider';


export type {
  VideoEditorPlugin,
  VideoEditorPluginSignature,
  ConvertPluginsIntoSignatures,
  MergeSignaturesProperty,
  VideoEditorPublicAPI,
  VideoEditorExperimentalFeatures,
} from './models';

// Core plugins
export type { VideoEditorCorePluginParameters } from './corePlugins';

// Plugins
export { useVideoEditorSelection } from './plugins/useVideoEditorSelection';
export type {
  UseVideoEditorSelectionSignature,
  UseVideoEditorSelectionParameters,
} from './plugins/useVideoEditorSelection';

export { buildWarning } from './utils/warning';
