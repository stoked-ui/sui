import { Emitter } from './emitter';
import { Events } from './events';
const PLAYING = 'playing';
const PAUSED = 'paused';
/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class TimelineEngine
 * @extends {Emitter<EventTypes>}
 */
export class TimelineEngine extends Emitter {
    constructor() {
        super(new Events());
    }
    /** requestAnimationFrame timerId */
    _timerId;
    /** Playback rate */
    _playRate = 1;
    /** current time */
    _currentTime = 0;
    /** Playback status */
    _playState = 'paused';
    /** Time frame pre data */
    _prev;
    /** Action effect map */
    _effectMap = {};
    /** Action map that needs to be run */
    _actionMap = {};
    /** Action ID array sorted in positive order by action start time */
    _actionSortIds = [];
    /** The currently traversed action index */
    _next = 0;
    /** The action time range contains the actionId list of the current time */
    _activeActionIds = [];
    /** Whether it is playing */
    get isPlaying() {
        return this._playState === 'playing';
    }
    /** Whether it is paused */
    get isPaused() {
        return this._playState === 'paused';
    }
    set effects(effects) {
        this._effectMap = effects;
    }
    set data(data) {
        if (this.isPlaying)
            this.pause();
        this._dealData(data);
        this._dealClear();
        this._dealEnter(this._currentTime);
    }
    /**
     * Set playback rate
     * @memberof TimelineEngine
     */
    setPlayRate(rate) {
        if (rate <= 0) {
            console.error('Error: rate cannot be less than 0!');
            return;
        }
        const result = this.trigger('beforeSetPlayRate', { rate, engine: this });
        if (!result)
            return false;
        this._playRate = rate;
        this.trigger('afterSetPlayRate', { rate, engine: this });
        return true;
    }
    /**
     * Get playback rate
     * @memberof TimelineEngine
     */
    getPlayRate() {
        return this._playRate;
    }
    /**
     * Re-render the current time
     * @return {*}
     * @memberof TimelineEngine
     */
    reRender() {
        if (this.isPlaying)
            return;
        this._tickAction(this._currentTime);
    }
    /**
     * Set playback time
     * @param {number} time
     * @param {boolean} [isTick] Whether it is triggered by a tick
     * @memberof TimelineEngine
     */
    setTime(time, isTick) {
        const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
        if (!result)
            return false;
        this._currentTime = time;
        this._next = 0;
        this._dealLeave(time);
        this._dealEnter(time);
        if (isTick)
            this.trigger('setTimeByTick', { time, engine: this });
        else
            this.trigger('afterSetTime', { time, engine: this });
        return true;
    }
    /**
     * Get the current time
     * @return {*} {number}
     * @memberof TimelineEngine
     */
    getTime() {
        return this._currentTime;
    }
    /**
     * Run: The start time is the current time
     * @param param
     * @return {boolean} {boolean}
     */
    play(param) {
        const { toTime, autoEnd } = param;
        const currentTime = this.getTime();
        /** The current state is being played or the running end time is less than the start time, return directly */
        if (this.isPlaying || (toTime && toTime <= currentTime))
            return false;
        //Set running status
        this._playState = PLAYING;
        // activeIds run start
        this._startOrStop('start');
        // trigger event
        this.trigger('play', { engine: this });
        this._timerId = requestAnimationFrame((time) => {
            this._prev = time;
            this._tick({ now: time, autoEnd, to: toTime });
        });
        return true;
    }
    /**
     * Pause playback
     * @memberof TimelineEngine
     */
    pause() {
        if (this.isPlaying) {
            this._playState = PAUSED;
            // activeIds run stop
            this._startOrStop('stop');
            this.trigger('paused', { engine: this });
        }
        cancelAnimationFrame(this._timerId);
    }
    /** Playback completed */
    _end() {
        this.pause();
        this.trigger('ended', { engine: this });
    }
    _startOrStop(type) {
        for (let i = 0; i < this._activeActionIds.length; i++) {
            const actionId = this._activeActionIds[i];
            const action = this._actionMap[actionId];
            const effect = this._effectMap[action?.effectId];
            if (type === 'start') {
                effect?.source?.start && effect.source.start({ action, effect, engine: this, isPlaying: this.isPlaying, time: this.getTime() });
            }
            else if (type === 'stop') {
                effect?.source?.stop && effect.source.stop({ action, effect, engine: this, isPlaying: this.isPlaying, time: this.getTime() });
            }
        }
    }
    /** Execute every frame */
    _tick(data) {
        if (this.isPaused)
            return;
        const { now, autoEnd, to } = data;
        // Calculate the current time
        let currentTime = this.getTime() + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
        this._prev = now;
        //Set the current time
        if (to && to <= currentTime)
            currentTime = to;
        this.setTime(currentTime, true);
        //Execute action
        this._tickAction(currentTime);
        // In the case of automatic stop, determine whether all actions have been executed.
        if (!to && autoEnd && this._next >= this._actionSortIds.length && this._activeActionIds.length === 0) {
            this._end();
            return;
        }
        // Determine whether to terminate
        if (to && to <= currentTime) {
            this._end();
        }
        if (this.isPaused)
            return;
        this._timerId = requestAnimationFrame((time) => {
            this._tick({ now: time, autoEnd, to });
        });
    }
    /** tick runs actions */
    _tickAction(time) {
        this._dealEnter(time);
        this._dealLeave(time);
        // render
        const length = this._activeActionIds.length;
        for (let i = 0; i < length; i++) {
            const actionId = this._activeActionIds[i];
            const action = this._actionMap[actionId];
            const effect = this._effectMap[action.effectId];
            if (effect && effect.source?.update) {
                effect.source.update({ time, action, isPlaying: this.isPlaying, effect, engine: this });
            }
        }
    }
    /** Reset active data */
    _dealClear() {
        while (this._activeActionIds.length) {
            const actionId = this._activeActionIds.shift();
            const action = this._actionMap[actionId];
            const effect = this._effectMap[action?.effectId];
            if (effect?.source?.leave) {
                effect.source.leave({ action, effect, engine: this, isPlaying: this.isPlaying, time: this.getTime() });
            }
        }
        this._next = 0;
    }
    /** Process action time enter */
    _dealEnter(time) {
        // add to active
        while (this._actionSortIds[this._next]) {
            const actionId = this._actionSortIds[this._next];
            const action = this._actionMap[actionId];
            if (!action.disable) {
                // Determine whether the action start time has arrived
                if (action.start > time)
                    break;
                //The action can be executed and started
                if (action.end > time && !this._activeActionIds.includes(actionId)) {
                    const effect = this._effectMap[action.effectId];
                    if (effect && effect.source?.enter) {
                        effect.source.enter({ action, effect, isPlaying: this.isPlaying, time, engine: this });
                    }
                    this._activeActionIds.push(actionId);
                }
            }
            this._next++;
        }
    }
    /** Handle action time leave */
    _dealLeave(time) {
        let i = 0;
        while (this._activeActionIds[i]) {
            const actionId = this._activeActionIds[i];
            const action = this._actionMap[actionId];
            // Not within the playback area
            if (action.start > time || action.end < time) {
                const effect = this._effectMap[action.effectId];
                if (effect && effect.source?.leave) {
                    effect.source.leave({ action, effect, isPlaying: this.isPlaying, time, engine: this });
                }
                this._activeActionIds.splice(i, 1);
                continue;
            }
            i++;
        }
    }
    /** Data processing */
    _dealData(data) {
        const actions = [];
        data.map((row) => {
            actions.push(...row.actions);
        });
        const sortActions = actions.sort((a, b) => a.start - b.start);
        const actionMap = {};
        const actionSortIds = [];
        sortActions.forEach((action) => {
            actionSortIds.push(action.id);
            actionMap[action.id] = { ...action };
        });
        this._actionMap = actionMap;
        this._actionSortIds = actionSortIds;
    }
}
//# sourceMappingURL=TimelineEngine.js.map