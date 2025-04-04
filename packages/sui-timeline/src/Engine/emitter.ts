/**
 * Emitter class
 * 
 * The Emitter class is a basic event dispatcher. It allows you to bind events,
 * trigger them, and handle their outcomes.
 */

export class Emitter<EmitterEvents> {
  /**
   * Events object
   * 
   * An object that maps event names to arrays of event handlers.
   */
  private events: { [key: string]: CallableFunction[] } = {};

  /**
   * Constructor
   * 
   * Initializes the emitter with an array of event handlers.
   * @param events - Array of event handlers
   */
  constructor(events: Events) {
    this.events = events.handlers;
  }

  /**
   * Bind event handler(s)
   * 
   * Adds one or more event handler functions to the specified event. If no name is provided, all events are bound.
   * @param names - Event names or array of event names
   * @param handler - Optional event handler function
   * @returns This emitter instance for method chaining
   */
  on<K extends keyof EmitterEvents>(names: K | K[], handler?: (args: EmitterEvents[K]) => boolean | unknown): this {
    const events = names instanceof Array ? names : (names as string).split(' ');

    (events as string[]).forEach((name) => {
      if (!this.events[name]) {
        throw new Error(`The event ${name} does not exist`);
      }
      this.events[name].push(handler);
    });

    return this;
  }

  /**
   * Trigger event(s)
   * 
   * Calls the specified event handler(s) with the provided arguments and returns a boolean indicating whether at least one of them returned false.
   * @param name - Event name
   * @param params - Event arguments
   * @returns A boolean value indicating the outcome of all event handlers
   */
  trigger<K extends keyof EmitterEvents>(name: K, params: EmitterEvents[K]) {
    if (!(name in this.events)) {
      throw new Error(`The event ${String(name)} cannot be triggered`);
    }

    return this.events[name as string].reduce((r: boolean, e: CallableFunction) => e(params) !== false && r, true);
  }

  /**
   * Bind a single event
   * 
   * Adds an event handler to the specified event.
   * @param name - Event name
   */
  bind(name: string) {
    if (this.events[name]) {
      throw new Error(`The event ${name} is already bound`);
    }

    this.events[name] = [];
  }

  /**
   * Check if an event exists
   * 
   * Returns a boolean indicating whether the specified event has any handlers.
   * @param name - Event name
   * @returns A boolean value
   */
  exist(name: string) {
    return Array.isArray(this.events[name]);
  }

  /**
   * Unbind event handler(s)
   * 
   * Removes one or more event handler functions from the specified event. If no name is provided, all events are unbound.
   * @param name - Event names or array of event names
   * @param handler - Optional event handler function
   */
  off<K extends keyof EmitterEvents>(name: K, handler?: (args: EmitterEvents[K]) => boolean | unknown) {
    if (this.events[name as string]) {
      const listener = this.events[name as string];
      if (!handler) {
        this.events[name as string] = [];
      }
      else {
        const index = listener.indexOf(handler);
        if (index !== -1) {
          listener.splice(index, 1);
        }
      }
    }
  }

  /**
   * Unbind all event handlers
   */
  offAll() {
    this.events = Object.fromEntries(Object.keys(this.events).map((name) => [name, []]));
  }
}