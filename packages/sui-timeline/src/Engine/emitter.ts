/**
 * Event dispatcher class for managing and handling events.
 * @template EmitterEvents - Generic type for defining event types.
 */
export class Emitter<EmitterEvents> {
  /**
   * Object to store event handlers.
   */
  events: { [key: string]: CallableFunction[] } = {};

  /**
   * Constructor for the Emitter class.
   * @param {Events} events - Object containing event handlers.
   */
  constructor(events: Events) {
    this.events = events.handlers;
  }

  /**
   * Register event handler for specified events.
   * @param {K | K[]} names - Name of the event or array of event names.
   * @param {(args: EmitterEvents[K]) => boolean | unknown} handler - Event handler function.
   * @returns {this} - Returns the Emitter instance.
   */
  on<K extends keyof EmitterEvents>(names: K | K[], handler: (args: EmitterEvents[K]) => boolean | unknown): this {
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
   * Trigger a specific event with provided parameters.
   * @param {K} name - Name of the event to trigger.
   * @param {EmitterEvents[K]} params - Parameters for the event.
   * @returns {boolean} - Returns true if all event handlers return true, false otherwise.
   */
  trigger<K extends keyof EmitterEvents>(name: K, params: EmitterEvents[K]): boolean {
    if (!(name in this.events)) {
      throw new Error(`The event ${String(name)} cannot be triggered`);
    }

    return this.events[name as string].reduce((r: boolean, e: CallableFunction) => e(params) !== false && r, true);
  }

  /**
   * Bind a new event.
   * @param {string} name - Name of the event to bind.
   */
  bind(name: string) {
    if (this.events[name]) {
      throw new Error(`The event ${name} is already bound`);
    }

    this.events[name] = [];
  }

  /**
   * Check if an event exists.
   * @param {string} name - Name of the event to check.
   * @returns {boolean} - Returns true if the event exists, false otherwise.
   */
  exist(name: string): boolean {
    return Array.isArray(this.events[name]);
  }

  /**
   * Remove a specific event handler.
   * @param {K} name - Name of the event.
   * @param {(args: EmitterEvents[K]) => boolean | unknown} handler - Event handler function to remove.
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
   * Remove all event handlers.
   */
  offAll() {
    this.events = Object.fromEntries(Object.keys(this.events).map((name) => [name, []]));
  }
}
