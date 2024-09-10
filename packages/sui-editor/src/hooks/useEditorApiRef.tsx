import * as React from 'react';
import {EditorAnyPluginSignature, EditorPublicAPI} from '../internals/models';
import {EditorPluginSignatures} from '../Editor/Editor.plugins';

/**
 * Hook that instantiates a [[EditorApiRef]].
 */
export const useEditorApiRef = <
  TSignatures extends readonly EditorAnyPluginSignature[] = EditorPluginSignatures,
>() =>
  React.useRef(undefined) as React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined>;
