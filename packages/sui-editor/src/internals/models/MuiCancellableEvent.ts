/**
 * Interface for a cancellable event in the Material-UI context.
 */
export type MuiCancellableEvent = {
  /**
   * Whether the event was prevented by default.
   */
  defaultMuiPrevented?: boolean;
};

/**
 * Type alias for a function that handles a cancellable event.
 * 
 * @template Event - The type of event to handle
 */
export type MuiCancellableEventHandler<Event> = (event: Event & MuiCancellableEvent) => void;