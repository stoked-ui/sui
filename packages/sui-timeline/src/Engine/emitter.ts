import {Events, type EventTypes} from './events';

/**
 * eventDispatcher
 */
export class Emitter<EmitterEvents> {
  events: { [key: string]: CallableFunction[] } = {};

  constructor(events: Events) {
    this.events = events.handlers;
  }

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

  trigger<K extends keyof EmitterEvents>(name: K, params: EmitterEvents[K]) {
    if (!(name in this.events)) {
      throw new Error(`The event ${String(name)} cannot be triggered`);
    }

    return this.events[name as string].reduce((r: boolean, e: CallableFunction) => e(params) !== false && r, true); // return false if at least one event is false
  }

  bind(name: string) {
    if (this.events[name]) {
      throw new Error(`The event ${name} is already bound`);
    }

    this.events[name] = [];
  }

  exist(name: string) {
    return Array.isArray(this.events[name]);
  }

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

  offAll() {
    this.events = Object.fromEntries(Object.keys(this.events).map((name) => [name, []]));
  }
}
