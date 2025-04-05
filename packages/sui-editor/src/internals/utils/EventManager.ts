/**
 * Represents a function that serves as an event listener.
 * @typedef {(...args: any[]) => void} EventListener
 */

/**
 * Options for configuring an event listener.
 * @typedef {object} EventListenerOptions
 * @property {boolean} [isFirst] - Specifies whether the listener should be the first to run
 */

/**
 * Collection of event listeners categorized by priority.
 */
interface EventListenerCollection {
  /**
   * List of listeners to run before the others.
   * They are executed in the opposite order of registration.
   */
  highPriority: Map<EventListener, true>;
  /**
   * List of events to run after the high priority listeners.
   * They are executed in the order of registration.
   */
  regular: Map<EventListener, true>;
}

/**
 * Manages event listeners and emits events.
 */
export class EventManager {
  /**
   * Maximum number of listeners allowed per event.
   */
  maxListeners = 20;

  /**
   * Indicates if a warning has been issued for exceeding the maximum number of listeners.
   */
  warnOnce = false;

  /**
   * Collection of events and their corresponding listeners.
   */
  events: { [eventName: string]: EventListenerCollection } = {};

  /**
   * Adds an event listener for a specific event.
   * @param {string} eventName - The name of the event to listen for.
   * @param {EventListener} listener - The function to be called when the event is emitted.
   * @param {EventListenerOptions} [options] - Additional options for the listener.
   */
  on(eventName: string, listener: EventListener, options: EventListenerOptions = {}): void {
    // Implementation details omitted for brevity.
  }

  /**
   * Removes a specific event listener.
   * @param {string} eventName - The name of the event from which the listener should be removed.
   * @param {EventListener} listener - The listener function to be removed.
   */
  removeListener(eventName: string, listener: EventListener): void {
    // Implementation details omitted for brevity.
  }

  /**
   * Removes all event listeners.
   */
  removeAllListeners(): void {
    // Implementation details omitted for brevity.
  }

  /**
   * Emits an event with the provided arguments.
   * @param {string} eventName - The name of the event to emit.
   * @param {...any} args - Arguments to be passed to the event listeners.
   */
  emit(eventName: string, ...args: any[]): void {
    // Implementation details omitted for brevity.
  }

  /**
   * Adds a one-time event listener that is automatically removed after being called.
   * @param {string} eventName - The name of the event to listen for.
   * @param {EventListener} listener - The function to be called once when the event is emitted.
   */
  once(eventName: string, listener: EventListener): void {
    // Implementation details omitted for brevity.
  }
}