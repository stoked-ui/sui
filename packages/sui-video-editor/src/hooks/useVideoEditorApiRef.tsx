import * as React from 'react';
import { VideoEditorAnyPluginSignature, VideoEditorPublicAPI } from '../internals/models';
import { VideoEditorPluginSignatures } from '../VideoEditor/VideoEditor.plugins';

/**
 * Hook that instantiates a [[VideoEditorApiRef]].
 */
export const useVideoEditorApiRef = <
  TSignatures extends readonly VideoEditorAnyPluginSignature[] = VideoEditorPluginSignatures,
>() =>
  React.useRef(undefined) as React.MutableRefObject<VideoEditorPublicAPI<TSignatures> | undefined>;
