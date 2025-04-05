/**
 * @typedef {Object} TimelineState
 * @property {HTMLElement} target - The DOM node
 * @property {Emitter<EmitterEvents>} listener - The Emitter for handling events
 * @property {IEngine} engine - The attached engine
 * @property {boolean} isPlaying - Flag indicating if the timeline is currently playing
 * @property {boolean} isPaused - Flag indicating if the timeline is currently paused
 * @property {function(number, boolean): void} setTime - Function to set the current playback time
 * @property {number} time - The current playback time
 * @property {function(number): void} setPlayRate - Function to set the playback rate
 * @property {function(): number} getPlayRate - Function to get the playback rate
 * @property {function(): void} reRender - Function to re-render the current time
 * @property {number} duration - The duration of the current video
 * @property {function({toTime?: number, autoEnd?: boolean, runActionIds?: string[]}): boolean} play - Function to start playing the timeline
 * @property {function(): void} pause - Function to pause the timeline
 * @property {function(number): void} setScrollLeft - Function to set the scroll left position
 * @property {function(number): void} setScrollTop - Function to set the scroll top position
 */