/**
 * Hook that instantiates a [[EditorApiRef]].
 *
 * @param {TSignatures} [TSignatures=EditorPluginSignatures] - The type of plugin signatures to use.
 * @returns {React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined>} A mutable reference to the editor API instance.
 */
export const useEditorApiRef = <
  TSignatures extends readonly EditorAnyPluginSignature[] = EditorPluginSignatures
>() =>
  React.useRef(undefined) as React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined>;