/**
 * Defines a type representing a cancellable event handler.
 * @template Event - The type of event being handled
 */
export type MuiCancellableEventHandler<Event> = (event: Event & MuiCancellableEvent) => void;

/**
 * Defines a type representing a cancellable event.
 */
export type MuiCancellableEvent = {
  defaultMuiPrevented?: boolean;
};