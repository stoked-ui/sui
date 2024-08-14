export class Events {
    handlers = {};
    constructor(handlers = {}) {
        this.handlers = {
            beforeSetTime: [],
            afterSetTime: [],
            setTimeByTick: [],
            beforeSetPlayRate: [],
            afterSetPlayRate: [],
            setActiveActionIds: [],
            play: [],
            paused: [],
            ended: [],
            ...handlers,
        };
    }
}
//# sourceMappingURL=events.js.map