/**
 * Type definition for a cancellable event.
 *
 * @interface MuiCancellableEvent
 */
export interface MuiCancellableEvent {
  /**
   * Whether the default MUI event was prevented.
   */
  defaultMuiPrevented?: boolean;
}

/**
 * Type definition for an event handler that accepts a cancellable event.
 *
 * @template Event - The type of event to handle
 * @interface MuiCancellableEventHandler
 * @param {Event & MuiCancellableEvent} event The event to handle, with cancellability information
 */
export interface MuiCancellableEventHandler<Event> {
  /**
   * Handles the given event and allows it to be cancelled if necessary.
   *
   * @param {Event & MuiCancellableEvent} event - The event to handle
   * @returns {void}
   */
  (event: Event & MuiCancellableEvent): void;
}