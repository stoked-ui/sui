/**
 * Represents the list of plugins used in the video editor.
 */
export const VIDEO_EDITOR_PLUGINS = [
  useEditorMetadata,
  useEditorKeyboard
] as const;

/**
 * Converts the list of video editor plugins into their corresponding signatures.
 */
export type EditorPluginSignatures = ConvertPluginsIntoSignatures<
  typeof VIDEO_EDITOR_PLUGINS
>;

/**
 * Represents the slots provided by the video editor plugins.
 */
export type EditorPluginSlots = MergeSignaturesProperty<
  EditorPluginSignatures,
  'slots'
>;

/**
 * Represents the slot props provided by the video editor plugins.
 */
export type EditorPluginSlotProps = MergeSignaturesProperty<
  EditorPluginSignatures,
  'slotProps'
>;

/**
 * Represents the parameters for the editor plugin, extending from UseEditorMetadataParameters.
 */
export interface EditorPluginParameters
  extends UseEditorMetadataParameters {}