import * as React from 'react';
import { EventHandlers } from '@mui/base/utils';
import type { VideoEditorContextValue } from '../VideoEditorProvider';
import {
  VideoEditorAnyPluginSignature,
  ConvertSignaturesIntoPlugins,
  MergeSignaturesProperty,
  VideoEditorInstance,
  VideoEditorPublicAPI,
  VideoEditorExperimentalFeatures,
} from '../models';

export interface UseVideoEditorParameters<
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TProps extends Partial<UseVideoEditorBaseProps<TSignatures>>,
> {
  plugins: ConvertSignaturesIntoPlugins<TSignatures>;
  rootRef?: React.Ref<HTMLDivElement> | undefined;
  props: TProps; // Omit<MergeSignaturesProperty<TSignatures, 'params'>, keyof UseVideoEditorBaseParameters<any>>
}

export interface UseVideoEditorBaseProps<TSignatures extends readonly VideoEditorAnyPluginSignature[]> {
  apiRef: React.MutableRefObject<VideoEditorPublicAPI<TSignatures> | undefined> | undefined;
  slots: MergeSignaturesProperty<TSignatures, 'slots'>;
  slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
  experimentalFeatures: VideoEditorExperimentalFeatures<TSignatures>;
}

export interface UseVideoEditorRootSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref: React.Ref<HTMLDivElement>;
}

export interface UseViewSpaceSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

export interface UseVideoEditorControlsSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

export interface UseTimelineSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

export interface UseBottomLeftSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

export interface UseBottomRightSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
}

export interface UseVideoEditorReturnValue<TSignatures extends readonly VideoEditorAnyPluginSignature[]> {
  getRootProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseVideoEditorRootSlotProps;
  getViewSpaceProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseViewSpaceSlotProps;
  getControlsProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseVideoEditorControlsSlotProps;
  getTimelineProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseTimelineSlotProps;
  getBottomLeftProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseBottomLeftSlotProps;
  getBottomRightProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseBottomRightSlotProps;
  rootRef: React.RefCallback<HTMLDivElement> | null;
  contextValue: VideoEditorContextValue<TSignatures>;
  instance: VideoEditorInstance<TSignatures>;
}
