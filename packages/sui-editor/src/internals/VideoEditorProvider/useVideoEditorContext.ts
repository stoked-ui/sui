import * as React from 'react';
import { VideoEditorAnyPluginSignature } from '../models';
import { VideoEditorContext } from './VideoEditorContext';
import { VideoEditorContextValue } from './VideoEditorProvider.types';

export const useVideoEditorContext = <
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TOptionalSignatures extends readonly VideoEditorAnyPluginSignature[] = [],
>() => {
  const context = React.useContext(VideoEditorContext) as VideoEditorContextValue<
    TSignatures,
    TOptionalSignatures
  >;
  if (context == null) {
    throw new Error(
      [
        'SUI X: Could not find the VideoEditor View context.',
        'It looks like you rendered your component outside of a VideoEditorBasic or VideoEditor parent component.',
        'This can also happen if you are bundling multiple versions of the VideoEditor View.',
      ].join('\n'),
    );
  }

  return context;
};
