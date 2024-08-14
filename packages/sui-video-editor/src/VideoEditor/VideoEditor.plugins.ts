
import {
  useVideoEditorSelection,
  UseVideoEditorSelectionParameters,
} from '../internals/plugins/useVideoEditorSelection';

import { ConvertPluginsIntoSignatures, MergeSignaturesProperty } from '../internals/models';

export const VIDEO_EDITOR_PLUGINS = [
  useVideoEditorSelection,
] as const;

export type VideoEditorPluginSignatures = ConvertPluginsIntoSignatures<
  typeof VIDEO_EDITOR_PLUGINS
>;

export type VideoEditorPluginSlots = MergeSignaturesProperty<
  VideoEditorPluginSignatures,
  'slots'
>;

export type VideoEditorPluginSlotProps = MergeSignaturesProperty<
  VideoEditorPluginSignatures,
  'slotProps'
>;

// We can't infer this type from the plugin, otherwise we would lose the generics.
export interface VideoEditorPluginParameters<Multiple extends boolean | undefined>
  extends UseVideoEditorSelectionParameters<Multiple> {}
