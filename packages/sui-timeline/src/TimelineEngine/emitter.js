/**
 * eventDispatcher
 */
export class Emitter {
    events = {};
    constructor(events) {
        this.events = events.handlers;
    }
    on(names, handler) {
        const events = names instanceof Array ? names : names.split(' ');
        events.forEach((name) => {
            if (!this.events[name]) {
                throw new Error(`The event ${name} does not exist`);
            }
            this.events[name].push(handler);
        });
        return this;
    }
    trigger(name, params) {
        if (!(name in this.events)) {
            throw new Error(`The event ${String(name)} cannot be triggered`);
        }
        return this.events[name].reduce((r, e) => e(params) !== false && r, true); // return false if at least one event is false
    }
    bind(name) {
        if (this.events[name]) {
            throw new Error(`The event ${name} is already bound`);
        }
        this.events[name] = [];
    }
    exist(name) {
        return Array.isArray(this.events[name]);
    }
    off(name, handler) {
        if (this.events[name]) {
            const listener = this.events[name];
            if (!handler)
                this.events[name] = [];
            else {
                const index = listener.indexOf(handler);
                if (index !== -1)
                    listener.splice(index, 1);
            }
        }
    }
    offAll() {
        this.events = Object.fromEntries(Object.keys(this.events).map((name) => [name, []]));
    }
}
//# sourceMappingURL=emitter.js.map