/**
 * Hook that instantiates a new EditorApiRef.
 * @template TSignatures - The type of EditorAnyPluginSignature array.
 * @returns {React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined>} A mutable reference object for EditorPublicAPI.
 */
export const useEditorApiRef = <
  TSignatures extends readonly EditorAnyPluginSignature[] = EditorPluginSignatures,
>() =>
  React.useRef(undefined) as React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined>;
*/