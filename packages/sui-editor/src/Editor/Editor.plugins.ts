import {
  useEditorMetadata, UseEditorMetadataParameters,
} from '../internals/plugins/useEditorMetadata';

import {ConvertPluginsIntoSignatures, MergeSignaturesProperty} from '../internals/models';
import {useEditorKeyboard} from "../internals/plugins/useEditorKeyboard";

export const VIDEO_EDITOR_PLUGINS = [
  useEditorMetadata,
  useEditorKeyboard
] as const;

export type EditorPluginSignatures = ConvertPluginsIntoSignatures<
  typeof VIDEO_EDITOR_PLUGINS
>;

export type EditorPluginSlots = MergeSignaturesProperty<
  EditorPluginSignatures,
  'slots'
>;

export type EditorPluginSlotProps = MergeSignaturesProperty<
  EditorPluginSignatures,
  'slotProps'
>;

// We can't infer this type from the plugin, otherwise we would lose the generics.
export interface EditorPluginParameters
  extends UseEditorMetadataParameters {}
