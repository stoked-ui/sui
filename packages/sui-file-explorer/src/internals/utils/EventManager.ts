/**
 * List of listeners to run before the others. They are run in the opposite order of the registration order.
 */
export interface EventListenerCollection {
  highPriority: Map<EventListener, true>;
  /**
   * List of events to run after the high priority listeners. They are run in the registration order.
   */
  regular: Map<EventListener, true>;
}

/**
 * Event manager for handling events with listeners.
 *
 * The event manager maintains a list of registered listeners for each event, and
 * provides methods for adding and removing listeners, as well as emitting events.
 *
 * @class EventManager
 */
export class EventManager {
  /**
   * Maximum number of listeners that can be registered for an event.
   * @type {number}
   */
  maxListeners = 20;

  /**
   * Flag indicating whether a warning should be logged when the maximum number of listeners is reached.
   * @type {boolean}
   */
  warnOnce = false;

  /**
   * Map of events to listener collections.
   * @type {{ [eventName: string]: EventListenerCollection }}
   */
  events: { [eventName: string]: EventListenerCollection } = {};

  /**
   * Adds a listener for an event. The listener can be either high-priority or regular.
   *
   * If the listener is high-priority, it will be run before all other listeners
   * in the opposite order of registration. If the listener is regular, it will
   * be run after all high-priority listeners in the order of registration.
   *
   * @param {string} eventName - The name of the event to add a listener for.
   * @param {EventListener} listener - The function to call when the event is emitted.
   * @param {EventListenerOptions} [options={}] - Options for the listener (e.g. isFirst).
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
   * Removes a listener for an event.
   *
   * @param {string} eventName - The name of the event to remove a listener from.
   * @param {EventListener} listener - The function to remove from the event.
   */
  removeListener(eventName: string, listener: EventListener): void {
    if (this.events[eventName]) {
      this.events[eventName].regular.delete(listener);
      this.events[eventName].highPriority.delete(listener);
    }
  }

  /**
   * Removes all listeners for an event.
   *
   * @param {string} eventName - The name of the event to remove all listeners from.
   */
  removeAllListeners(): void {
    this.events = {};
  }

  /**
   * Emits an event and calls all registered listeners.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {...any[]} args - Arguments to pass to the listener functions.
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
   * Adds a one-time listener for an event. The listener will only be called once,
   * after which it will be removed.
   *
   * @param {string} eventName - The name of the event to add a one-time listener for.
   * @param {EventListener} listener - The function to call when the event is emitted.
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