import * as React from 'react';

export interface FileExplorerEventLookupElement {
  params: object;
}

export type FileExplorerEventListener<E extends FileExplorerEventLookupElement> = (
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

