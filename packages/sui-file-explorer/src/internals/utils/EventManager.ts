/**
 * @typedef {(...args: any[]) => void} EventListener
 */

/**
 * @typedef {Object} EventListenerOptions
 * @property {boolean} [isFirst] - Flag to indicate if listener should be run first
 */

/**
 * @typedef {Object} EventListenerCollection
 * @property {Map<EventListener, true>} highPriority - List of listeners to run before the others
 * @property {Map<EventListener, true>} regular - List of events to run after the high priority listeners
 */

/**
 * Class representing an Event Manager
 */
export class EventManager {
  /**
   * Maximum number of listeners allowed
   */
  maxListeners = 20;

  /**
   * Flag to track if warning has been displayed once
   */
  warnOnce = false;

  /**
   * Collection of events and their listeners
   */
  events: { [eventName: string]: EventListenerCollection } = {};

  /**
   * Add a listener to an event
   * @param {string} eventName - The name of the event
   * @param {EventListener} listener - The listener function
   * @param {EventListenerOptions} [options] - Options for the listener
   */
  on(eventName: string, listener: EventListener, options: EventListenerOptions = {}): void {
    // Logic to add a listener to the event
  }

  /**
   * Remove a listener from an event
   * @param {string} eventName - The name of the event
   * @param {EventListener} listener - The listener function to remove
   */
  removeListener(eventName: string, listener: EventListener): void {
    // Logic to remove a listener from the event
  }

  /**
   * Remove all listeners from all events
   */
  removeAllListeners(): void {
    // Logic to remove all listeners from all events
  }

  /**
   * Emit an event and invoke all its listeners
   * @param {string} eventName - The name of the event to emit
   * @param {...any} args - Arguments to pass to the event listeners
   */
  emit(eventName: string, ...args: any[]): void {
    // Logic to emit an event and invoke its listeners
  }

  /**
   * Add a listener to an event that runs only once
   * @param {string} eventName - The name of the event
   * @param {EventListener} listener - The listener function to run once
   */
  once(eventName: string, listener: EventListener): void {
    // Logic to add a one-time listener to the event
  }
}