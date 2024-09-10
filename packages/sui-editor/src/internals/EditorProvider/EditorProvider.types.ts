import * as React from 'react';
import {
  EditorAnyPluginSignature,
  EditorInstance,
  EditorPublicAPI,
  MergeSignaturesProperty,
  VideoPluginResponse,
} from '../models';

export type VideoPluginsRunner = <TProps extends {}>(
  props: TProps,
) => Required<VideoPluginResponse>;

export type EditorContextValue<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TOptionalSignatures extends readonly EditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<TSignatures, 'contextValue'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'contextValue'>> & {
    instance: EditorInstance<TSignatures, TOptionalSignatures>;
    publicAPI: EditorPublicAPI<TSignatures, TOptionalSignatures>;
    rootRef: React.RefObject<HTMLDivElement>;
    runItemPlugins: VideoPluginsRunner;
  };

export interface EditorProviderProps<TSignatures extends readonly EditorAnyPluginSignature[]> {
  value: EditorContextValue<TSignatures>;
  children: React.ReactNode;
}
