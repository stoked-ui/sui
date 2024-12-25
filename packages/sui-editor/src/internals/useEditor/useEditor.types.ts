import * as React from 'react';
import {EventHandlers} from '@mui/base/utils';
import {ITimelineTrack, TimelineSlotProps} from "@stoked-ui/timeline";
import { IMediaFile } from '@stoked-ui/media-selector';
import type {EditorContextValue} from '../EditorProvider';
import {
  ConvertSignaturesIntoPlugins,
  EditorAnyPluginSignature,
  EditorExperimentalFeatures,
  EditorInstance,
  EditorPublicAPI,
  MergeSignaturesProperty,
} from '../models';
import { SxProps } from '@mui/system';


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
  tracks: ITimelineTrack[];
}

export interface UseFileExplorerTabsSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLDivElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  ref?: React.Ref<HTMLDivElement>;
  tabs: Record<string, IMediaFile[]>
  sx?: SxProps
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
  ) => TimelineSlotProps & { className?: string | undefined; style?: React.CSSProperties | undefined; ref?: React.Ref<any> | undefined; };
  getFileExplorerTabsProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseFileExplorerTabsSlotProps;
  rootRef: React.RefCallback<HTMLDivElement> | null;
  contextValue: EditorContextValue<TSignatures>;
  instance: EditorInstance<TSignatures>;
  id: string;
}
