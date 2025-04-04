/**
 * Defines the FileExplorerEventLookupElement interface, which represents the parameters for a file explorer event lookup.
 */
export interface FileExplorerEventLookupElement {
  /**
   * The object containing the parameters for the file explorer event lookup.
   */
  params: object;
}

/**
 * Defines the type of event listener that can be used with the file explorer component.
 * @template E The type of parameters that will be passed to the event listener.
 */
export type FileExplorerEventListener<E extends FileExplorerEventLookupElement> = (
  /**
   * The parameters for the file explorer event lookup, as defined by the FileExplorerEventLookupElement interface.
   */
  params: E['params'],
  /**
   * The MUI event object that is being passed to the event listener.
   */
  event: MuiEvent<{}>,
) => void;

/**
 * Defines the base type for all MUI events, which can be either a React event or a document event.
 */
export type MuiBaseEvent =
  /**
   * A React synthetic event object, which is an event that has been emitted from a React component.
   */
  | React.SyntheticEvent<HTMLElement>
  /**
   * A document event map, which contains all the available document events.
   */
  | DocumentEventMap[keyof DocumentEventMap]
  /**
   * An empty type, representing no event object.
   */
  | {};

/**
 * Defines the MUI event type, which extends the base MUI event type and adds a defaultMuiPrevented property.
 * @template E The type of parameters that will be passed to the event listener, or null if not provided.
 */
export type MuiEvent<E extends MuiBaseEvent = MuiBaseEvent> = E & {
  /**
   * Whether the event has been prevented by the MUI event handling system.
   */
  defaultMuiPrevented?: boolean;
};