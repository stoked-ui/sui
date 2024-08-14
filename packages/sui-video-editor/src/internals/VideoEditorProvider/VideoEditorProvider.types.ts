import * as React from 'react';
import {
  VideoEditorAnyPluginSignature,
  VideoEditorInstance,
  VideoEditorPublicAPI,
  VideoPluginResponse,
  MergeSignaturesProperty,
} from '../models';

export type VideoPluginsRunner = <TProps extends {}>(
  props: TProps,
) => Required<VideoPluginResponse>;

export type VideoEditorContextValue<
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TOptionalSignatures extends readonly VideoEditorAnyPluginSignature[] = [],
> = MergeSignaturesProperty<TSignatures, 'contextValue'> &
  Partial<MergeSignaturesProperty<TOptionalSignatures, 'contextValue'>> & {
    instance: VideoEditorInstance<TSignatures, TOptionalSignatures>;
    publicAPI: VideoEditorPublicAPI<TSignatures, TOptionalSignatures>;
    rootRef: React.RefObject<HTMLDivElement>;
    runItemPlugins: VideoPluginsRunner;
  };

export interface VideoEditorProviderProps<TSignatures extends readonly VideoEditorAnyPluginSignature[]> {
  value: VideoEditorContextValue<TSignatures>;
  children: React.ReactNode;
}
