/**
 * Interface for a File Explorer Event Lookup Element.
 * @typedef {object} FileExplorerEventLookupElement
 * @property {object} params - Parameters for the event lookup element.
 */

/**
 * Type for a File Explorer Event Listener.
 * @template E - Type of the File Explorer Event Lookup Element.
 * @param {E['params']} params - Parameters for the event.
 * @param {MuiEvent<{}>} event - MUI event object.
 */
export type FileExplorerEventListener<E extends FileExplorerEventLookupElement> = (
  params: E['params'],
  event: MuiEvent<{}>,
) => void;

/**
 * Type for a MUI Base Event, which can be a SyntheticEvent, DocumentEvent, or empty object.
 */
export type MuiBaseEvent =
  | React.SyntheticEvent<HTMLElement>
  | DocumentEventMap[keyof DocumentEventMap]
  | {};

/**
 * Type for a MUI Event, extending MuiBaseEvent with a defaultMuiPrevented flag.
 * @template E - Type of the MUI Base Event.
 * @property {boolean} defaultMuiPrevented - Flag indicating if default MUI behavior is prevented.
 */
export type MuiEvent<E extends MuiBaseEvent = MuiBaseEvent> = E & {
  defaultMuiPrevented?: boolean;
};
