export type EventListener = (...args: any[]) => void;

/**
 * Options for event listeners.
 */
export interface EventListenerOptions {
  /**
   * Whether this is the first listener added to the event.
   */
  isFirst?: boolean;
}

interface EventListenerCollection {
  /**
   * List of high-priority listeners. They are run in reverse order
   * of registration.
   */
  highPriority: Map<EventListener, true>;
  /**
   * List of regular listeners. They are run in the order of
   * registration.
   */
  regular: Map<EventListener, true>;
}

/**
 * Manages event listeners and their execution order.
 *
 * @class EventManager
 */
export class EventManager {
  /**
   * Maximum number of listeners that can be registered before warnings start being logged.
   */
  maxListeners = 20;

  /**
   * Whether to log a warning once when the maximum number of listeners is reached.
   */
  warnOnce = false;

  /**
   * Map of event names to their corresponding listener collections.
   */
  events: { [eventName: string]: EventListenerCollection } = {};

  /**
   * Adds a new listener to an event.
   *
   * @param eventName The name of the event.
   * @param listener The function that will be called when the event is emitted.
   * @param options Optional configuration for the listener, including whether it should be
   *                 high-priority or not.
   */
  on(eventName: string, listener: EventListener, options: EventListenerOptions = {}): void {
    let collection = this.events[eventName];

    if (!collection) {
      collection = {
        highPriority: new Map(),
        regular: new Map(),
      };
      this.events[eventName] = collection;
    }

    if (options.isFirst) {
      collection.highPriority.set(listener, true);
    } else {
      collection.regular.set(listener, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      const collectionSize = collection.highPriority.size + collection.regular.size;
      if (collectionSize > this.maxListeners && !this.warnOnce) {
        this.warnOnce = true;
        console.warn(
          [
            `Possible EventEmitter memory leak detected. ${collectionSize} ${eventName} listeners added.`,
          ].join('\n'),
        );
      }
    }
  }

  /**
   * Removes a listener from an event.
   *
   * @param eventName The name of the event.
   * @param listener The function that was registered to listen for this event.
   */
  removeListener(eventName: string, listener: EventListener): void {
    if (this.events[eventName]) {
      this.events[eventName].regular.delete(listener);
      this.events[eventName].highPriority.delete(listener);
    }
  }

  /**
   * Removes all listeners from an event.
   */
  removeAllListeners(): void {
    this.events = {};
  }

  /**
   * Emits an event, calling all registered listeners in the specified order.
   *
   * @param eventName The name of the event to emit.
   * @param args The arguments to pass to each listener function.
   */
  emit(eventName: string, ...args: any[]): void {
    const collection = this.events[eventName];
    if (!collection) {
      return;
    }

    const highPriorityListeners = Array.from(collection.highPriority.keys());
    const regularListeners = Array.from(collection.regular.keys());

    for (let i = highPriorityListeners.length - 1; i >= 0; i -= 1) {
      const listener = highPriorityListeners[i];
      if (collection.highPriority.has(listener)) {
        listener.apply(this, args);
      }
    }

    for (let i = 0; i < regularListeners.length; i += 1) {
      const listener = regularListeners[i];
      if (collection.regular.has(listener)) {
        listener.apply(this, args);
      }
    }
  }

  /**
   * Registers a one-time listener for an event.
   *
   * @param eventName The name of the event to listen to.
   * @param listener The function that will be called when the event is emitted.
   */
  once(eventName: string, listener: EventListener): void {
    // eslint-disable-next-line consistent-this
    const that = this;
    this.on(eventName, function oneTimeListener(...args) {
      that.removeListener(eventName, oneTimeListener);
      listener.apply(that, args);
    });
  }
}