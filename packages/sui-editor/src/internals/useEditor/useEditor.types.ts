import * as React from 'react';
import { EventHandlers } from '@mui/base/utils';
import type { EditorContextValue } from '../EditorProvider';
import {
  EditorAnyPluginSignature,
  ConvertSignaturesIntoPlugins,
  MergeSignaturesProperty,
  EditorInstance,
  EditorPublicAPI,
  EditorExperimentalFeatures,
} from '../models';
import { TimelineTrack } from "@stoked-ui/timeline";

export interface UseEditorParameters<
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
> {
  plugins: ConvertSignaturesIntoPlugins<TSignatures>;
  rootRef?: React.Ref<HTMLDivElement> | undefined;
  props: TProps; // Omit<MergeSignaturesProperty<TSignatures, 'params'>, keyof UseEditorBaseParameters<any>>
}

export interface UseEditorBaseProps<TSignatures extends readonly EditorAnyPluginSignature[]> {
  apiRef: React.MutableRefObject<EditorPublicAPI<TSignatures> | undefined> | undefined;
  slots: MergeSignaturesProperty<TSignatures, 'slots'>;
  slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
  experimentalFeatures: EditorExperimentalFeatures<TSignatures>;
}

export interface UseEditorRootSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref: React.Ref<HTMLDivElement>;
}

export interface UseEditorViewSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.RefObject<HTMLDivElement>;
}

export interface UseEditorControlsSlotProps
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
  tracks: TimelineTrack[];
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

export interface UseEditorReturnValue<TSignatures extends readonly EditorAnyPluginSignature[]> {
  getRootProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseEditorRootSlotProps;
  getEditorViewProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseEditorViewSlotProps;
  getControlsProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseEditorControlsSlotProps;
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
  contextValue: EditorContextValue<TSignatures>;
  instance: EditorInstance<TSignatures>;
}
