import * as React from 'react';

/**
 * The EditorEventLookupElement interface represents the structure of data passed to an editor event listener.
 * It contains a params object, which can be used to store arbitrary data related to the event.
 */
export interface EditorEventLookupElement {
  /**
   * The params object passed to the editor event listener.
   */
  params: object;
}

/**
 * The EditorEventListener type represents a function that takes an editor event and its parameters,
 * and returns void. The type is constrained to work with EditorEventLookupElement objects.
 */
export type EditorEventListener<E extends EditorEventLookupElement> = (
  /**
   * The params object passed to the editor event listener.
   */
  params: E['params'],
  /**
   * The MuiEvent object representing the editor event.
   */
  event: MuiEvent<{}>,
) => void;

/**
 * The MuiBaseEvent type represents the base structure of a Mui event, which can be a React SyntheticEvent,
 * DocumentEventMap[keyof DocumentEventMap], or an empty object.
 */
export type MuiBaseEvent =
  | React.SyntheticEvent<HTMLElement>
  | DocumentEventMap[keyof DocumentEventMap]
  | {};

/**
 * The MuiEvent type extends the base event structure with a defaultMuiPrevented property, which indicates
 * whether the event was prevented by default.
 */
export type MuiEvent<E extends MuiBaseEvent = MuiBaseEvent> = E & {
  /**
   * A boolean indicating whether the event was prevented by default.
   */
  defaultMuiPrevented?: boolean;
};