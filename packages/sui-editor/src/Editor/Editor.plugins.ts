/**
 * Import necessary plugins and models for use in the video editor application.
 */
import {
  useEditorMetadata, UseEditorMetadataParameters,
} from '../internals/plugins/useEditorMetadata';

/**
 * Import utility functions to convert plugins into signatures and merge signatures properties.
 */
import {ConvertPluginsIntoSignatures, MergeSignaturesProperty} from '../internals/models';
import {useEditorKeyboard} from "../internals/plugins/useEditorKeyboard";

/**
 * Define the list of video editor plugins that can be used in the application.
 * @type {Array<Function>}
 */
export const VIDEO_EDITOR_PLUGINS = [
  useEditorMetadata,
  useEditorKeyboard
] as const;

/**
 * Define the type for EditorPluginSignatures, which is derived from ConvertPluginsIntoSignatures.
 * This type represents the combined signatures of all available video editor plugins.
 * @type {Type}
 */
export type EditorPluginSignatures = ConvertPluginsIntoSignatures<
  typeof VIDEO_EDITOR_PLUGINS
>;

/**
 * Define the type for EditorPluginSlots, which is merged property 'slots' from EditorPluginSignatures.
 * This type represents the slots that can be used in an editor plugin.
 * @type {Type}
 */
export type EditorPluginSlots = MergeSignaturesProperty<
  EditorPluginSignatures,
  'slots'
>;

/**
 * Define the type for EditorPluginSlotProps, which is merged property 'slotProps' from EditorPluginSignatures.
 * This type represents the props that can be used in an editor plugin slot.
 * @type {Type}
 */
export type EditorPluginSlotProps = MergeSignaturesProperty<
  EditorPluginSignatures,
  'slotProps'
>;

/**
 * Define the interface for EditorPluginParameters, which extends UseEditorMetadataParameters.
 * This interface represents the parameters required to use a video editor plugin.
 * @interface
 */
// We can't infer this type from the plugin, otherwise we would lose the generics.
export interface EditorPluginParameters
  extends UseEditorMetadataParameters {}