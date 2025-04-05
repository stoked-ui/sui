/**
 * Custom hook to access the EditorContextValue in a component.
 * @template TSignatures - The required EditorAnyPluginSignature array.
 * @template TOptionalSignatures - The optional EditorAnyPluginSignature array.
 * @returns {EditorContextValue<TSignatures, TOptionalSignatures>} The EditorContextValue containing the required and optional signatures.
 */
export const useTimeline = <
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
>() => {
  const context = React.useContext(EditorContext) as EditorContextValue<
    TSignatures,
    TOptionalSignatures
  >;
  if (context == null) {
    throw new Error(
      [
        'SUI X: Could not find the Editor View context.',
        'It looks like you rendered your component outside of a EditorBasic or Editor parent component.',
        'This can also happen if you are bundling multiple versions of the Editor View.',
      ].join('\n'),
    );
  }

  return context;
};