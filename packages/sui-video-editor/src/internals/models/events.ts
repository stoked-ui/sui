import * as React from 'react';

export interface VideoEditorEventLookupElement {
  params: object;
}

export type VideoEditorEventListener<E extends VideoEditorEventLookupElement> = (
  params: E['params'],
  event: MuiEvent<{}>,
) => void;

export type MuiBaseEvent =
  | React.SyntheticEvent<HTMLElement>
  | DocumentEventMap[keyof DocumentEventMap]
  | {};

export type MuiEvent<E extends MuiBaseEvent = MuiBaseEvent> = E & {
  defaultMuiPrevented?: boolean;
};
