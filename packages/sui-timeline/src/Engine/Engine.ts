import BTree from "sorted-btree";
import {openDB} from '@tempfix/idb';
import {getKeysStartingWithPrefix} from "../db/get";
import {type ITimelineAction} from '../TimelineAction/TimelineAction.types'
import {DrawData, type IController} from '../Controller/Controller.types';
import {
  type IEngine,
  type EngineState,
  ScreenerBlob,
  type ViewMode,
  type EngineOptions,
  Version, MediaFileFromScreenerBlob
} from './Engine.types';
import { type ITimelineTrack} from '../TimelineTrack/TimelineTrack.types';
import {Events, type EventTypes} from './events'
import {Emitter} from './emitter'
;

const PLAYING = 'playing';
const PAUSED = 'paused';

/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Emitter<EventTypes>}
 */
export default class Engine<State extends EngineState = EngineState, Events extends EventTypes = EventTypes> implements IEngine<Events> {

  protected _viewer: HTMLElement | null = null;

  protected _renderer: HTMLCanvasElement | null = null;

  protected _renderCtx: CanvasRenderingContext2D | null = null;

  protected _rendererDetail: HTMLCanvasElement | null = null;

  protected _renderDetailCtx: CanvasRenderingContext2D | null = null

  protected  _renderWidth: number = 0;

  protected _renderHeight: number = 0;

  protected _screener: HTMLVideoElement | null = null;

  protected _screenerBlob: ScreenerBlob | null = null;

  protected _stage: HTMLDivElement | null = null;

  protected _logging: boolean = false;

  detailMode: boolean = false;

  control: any = {};

  /** requestAnimationFrame timerId */
  protected _timerId: number = 0;

  /** Playback rate */
  protected _playRate = 1;

  /** current time */
  protected _currentTime: number = 0;

  /** Playback status */
  protected _state: State;

  protected _viewMode: ViewMode;

  /** Time frame pre data */
  protected _prev: number = 0;

  /** Action actionType map */
  protected _controllers: Record<string, IController> = {};

  /** Action map that needs to be run */
  protected _actionMap: Record<string, ITimelineAction> = {};

  protected _actionTrackMap: Record<string, ITimelineTrack> = {};

  /** Action ID array sorted in positive order by action start time */
  protected _actionSortIds: string[] = [];

  /** The currently traversed action index */
  protected _next: number = 0;

  /** The action time range contains the actionId list of the current time */
  protected _activeIds: BTree = new BTree<string, number>();

  emitter: Emitter<Events>

  constructor(params: EngineOptions ) {
    this.emitter = new Emitter<Events>(params.events ?? new Events());
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }
    this._state = 'loading' as State;
    this._viewMode = 'Renderer';
  }

  get logging() {
    return this._logging;
  }

  set logging(enableLogging: boolean) {
    this._logging = enableLogging;
    const controllers: IController[] = Object.values(this._controllers);

    for (let i = 0; i < controllers.length; i += 1){
      const controller = controllers[i];
      controller.logging = enableLogging;
    }
  }

  get screener() {
    return this._screener;
  }

  get screenerBlob() {
    return this._screenerBlob;
  }

  set screenerBlob(blob: ScreenerBlob) {
    this._screenerBlob = blob;
  }

  get actions() {
    return this._actionMap;
  }

  get action(): ITimelineAction | undefined {
    const vals = Object.values(this._actionMap)
    if (vals.length) {
      return vals[0];
    }
    return undefined;
  }

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    const renderer = viewer.querySelector("canvas[role='renderer']") as HTMLCanvasElement;
    this._screener = viewer.querySelector("video[role='screener']") as HTMLVideoElement;
    this._stage = viewer.querySelector("div[role='stage']") as HTMLDivElement;
    if (renderer) {
      renderer.width = this.renderWidth;
      renderer.height = this.renderHeight;

      this._renderer = renderer;

      const ctx = renderer.getContext('2d', { alpha: true, willReadFrequently: true });
      if (ctx) {
        this._renderCtx = ctx;
        this._renderCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);

      }
    }

    this._viewerUpdate();
    if (this.renderer && this.viewer && this.renderCtx) {
      this._state = 'paused' as State;
    } else {
      throw new Error('Assigned a viewer but could not locate the renderer, renderCtx, or' +
                      ' preview elements.\n' +
                      'Please ensure that the viewer has the following children:\n' +
                      `  - renderer (canvas with working 2d context): ${this.renderer}` +
                      `  - viewer: ${this.viewer}`);
    }
  }

  get viewer(): HTMLElement | null {
    return this._viewer;
  }

  get stage(): HTMLDivElement | null {
    return this._stage;
  }

  get duration() {
    const actions = Object.values(this._actionMap);
    let end = 0;
    for(let i = 0; i < actions.length; i += 1) {
      if (actions[i].end > end) {
        end = actions[i].end;
      }
    }
    return end;
  }

  get renderer(): HTMLCanvasElement | null {
    return this._renderer;
  }

  set renderer(canvas: HTMLCanvasElement) {
    this._renderer = canvas;
    if (canvas) {
      canvas.width = this.renderWidth;
      canvas.height = this.renderHeight;
      const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

      if (!ctx) {
        throw new Error('Could not get 2d context from renderer');
      }
      this._renderCtx = ctx;
      this._renderCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }
  }

  get renderCtx() {
    return this._renderCtx;
  }

  get rendererDetail() {
    return this._rendererDetail;
  }

  set rendererDetail(canvas: HTMLCanvasElement) {
    this._rendererDetail = canvas;
    if (canvas) {
      canvas.width = this.renderWidth;
      canvas.height = this.renderHeight;
      const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

      if (!ctx) {
        throw new Error('Could not get 2d context from renderer');
      }
      this._renderDetailCtx = ctx;
      this._renderDetailCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }
  }

  get renderDetailCtx() {
    return this._renderDetailCtx;
  }

  setRenderView(width: number, height: number) {
    this._renderWidth = width;
    this._renderHeight = height;
  }

  get renderWidth() {
    return this._renderWidth || 1920
  }

  get renderHeight() {
    return this._renderHeight || 1080
  }

  get viewMode() {
    return this._viewMode;
  }

  async setViewMode(viewMode: ViewMode) {
    if (viewMode === this._viewMode) {
      return;
    }
    if (viewMode === 'Renderer') {
      this._screener.style.display = 'none';
      this._renderer.style.display = 'flex';
    } else if (viewMode === 'Screener') {
      this._screener.style.display = 'flex';
      this._renderer.style.display = 'none';
    }
  /*   if (viewMode === 'Screener' && !this.screenerTrack) {
      if (!this.screenerBlob) {
        return;
      }

      const url = URL.createObjectURL(this.screenerBlob?.blob)
      const actionInput = {
        name: `${this.screenerBlob.name} v${this.screenerBlob.version}`,
        start: 0,
        end: 1,
        controllerName: 'video',
        src: url,
        layer: 'screener',
      }

      // this.screenerTrack = await this.buildScreenerTrack(this._controllers.video, actionInput)
      this.screener.src = url;
    } */
    this._viewMode = viewMode;
  }

  static async loadVersion(dbKey: string | number): Promise<ScreenerBlob> {
    const db = await openDB('editor', 1);
    const store = db.transaction('video').objectStore('video');
    return store.get(dbKey);
  };

  async getVersionKeys(id: string) {
    const matchingKeys = await getKeysStartingWithPrefix('editor', 'video', id)
    return matchingKeys.map((match) => {
      const parts = match.split('|');
      return { id: parts[0], version: Number(parts[1]), key: match} as Version;
    })
  }

  async getVersions(id: string): Promise<ScreenerBlob[]> {
    const versions = await this.getVersionKeys(id);
    const promises = versions.map((version) => Engine.loadVersion(version.key))
    return Promise.all(promises);
  }

  async versionFiles(id: string) {
    const versionBlobs = await this.getVersions(id);
    return versionBlobs.map((versionBlob) => {
     /*  const newId = versionBlob.key;
      const type = 'video/mp4';
      const mediaType = 'video';
      const fileBase = {
        mime: type,
        type: mediaType,
        id: newId,
        itemId: newId,

        label: versionBlob.name,
        expanded: false,
        modified: Date.now(),
        size: 0,
        children: [] as IMediaFile[],
        parent: null,
      } as IMediaFile; */
      return MediaFileFromScreenerBlob(versionBlob);
    })
  }

  getAction(actionId: string) {
    return {
      action: this._actionMap[actionId],
      track: this._actionTrackMap[actionId]
    };
  }

  getActionTrack(actionId: string) {
    return this._actionTrackMap[actionId];
  }

  getSelectedActions() {
    const actionTracks: {action: ITimelineAction, track: ITimelineTrack}[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, ] of this._activeIds.entries()) {
      const action = this._actionMap[key];
      if (action.selected) {
        actionTracks.push({ action, track: this._actionTrackMap[key] });
      }
    }
    return actionTracks;
  }

  get loading() {
    return this._state === 'loading';
  }

  get isLoading() {
    return this._state === 'loading';
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._state === 'playing';
  }

  /** Whether it is paused */
  get isPaused() {
    return this._state === 'paused';
  }

  set controllers(controllers: Record<string, IController>) {
    this._controllers = controllers;
    this.logging = this._logging;
  }

  setTracks(tracks: ITimelineTrack[]) {
    console.info('tracks', tracks);
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  loaded() {
    if (this._renderCtx && this._state === 'loading') {
      this._state = 'paused' as State;
    }
  }
  /**
   * Set playback rate
   * @memberof Engine
   */
  setPlayRate(rate: number): boolean {
    if (rate <= -3.0 || rate >= 3.0) {
      console.error('Error: rate cannot be less than -3 or more than 3!');
      return false;
    }
    const result = this.trigger('beforeSetPlayRate', { rate, engine: this as IEngine });
    if (!result) {
      return false;
    }
    this._playRate = rate;
    this.trigger('afterSetPlayRate', { rate, engine: this as IEngine });

    return true;
  }

  async saveVersion(vidBlob: ScreenerBlob) {
    let res;
    try {

      // Create an example Blob object
      const db = await openDB('editor', 1);
      const store = db.transaction('video', 'readwrite').objectStore('video');

      // Store the object
      const req = await store.put(vidBlob, vidBlob.key);
      res = req;
    } catch (e) {
      console.error(e);
      throw new Error(e as string);
    }
    return res;
  };

  /**
   * Get playback rate
   * @memberof Engine
   */
  getPlayRate() {
    return this._playRate;
  }

  /**
   * Re-render the current time
   * @return {*}
   * @memberof Engine
   */
  reRender() {
    if (this.isPlaying) {
      return;
    }
    this.tickAction(this._currentTime);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof Engine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this as IEngine });
    if (!result) {
      return false;
    }
    if (this._viewMode === 'Renderer') {
      this._currentTime = time;
    } else {
      this._screener.currentTime = time;
    }

    this._next = 0;
    if (this.detailMode) {
      this.renderDetailCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight);
    } else {
      this.renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }
    this._dealLeave(time);
    this._dealEnter(time);

    if (isTick) {
      this.trigger('setTimeByTick', { time, engine: this as IEngine });
    }
    else {
      this.trigger('afterSetTime', { time, engine: this as IEngine });
    }
    return true;
  }

  /**
   * Get the current time
   * @return {*} {number}
   * @memberof Engine
   */
  getTime(): number {
    return this._viewMode === 'Renderer' ? this._currentTime : this._screener.currentTime;
  }

  /**
   * Run: The start time is the current time
   * @param param
   * @return {boolean} {boolean}
   */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.getTime();
    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    // Set running status
    this._state = PLAYING as State;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play', { engine: this as IEngine });
    if (this.viewMode === 'Screener') {
      this.screener.play()
        .then(() => {
          this._timerId = requestAnimationFrame((time: number) => {

            this._prev = time;
            this._tick({now: time, autoEnd, to: toTime});
          });
        })
    } else {
      this._timerId = requestAnimationFrame((time: number) => {
        this._prev = time;
        this._tick({now: time, autoEnd, to: toTime});
      });
    }

    return true;
  }

  /**
   * Pause playback
   * @memberof Engine
   */
  pause() {
    if (this.isPlaying) {
      const previousState: State = this._state;
      this._state = PAUSED as State;

      if (this._viewMode === 'Screener') {
        this._screener.pause();
        return;
      }

      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused', { engine: this as IEngine, previousState });
    }
    cancelAnimationFrame(this._timerId);
  }

  /** Playback completed */
  protected _end() {
    this.pause();
    this.trigger('ended', { engine: this as IEngine });
  }

  protected _assignElements() {
    const getEditorRole = (role: string) => {
      return document.querySelector(`[role=${role}]`)
    }
    const renderer = getEditorRole('renderer');
    if (renderer) {
      this.renderer = renderer as HTMLCanvasElement;
    }
  }

  protected _viewerUpdate() {
    this._assignElements()
    const controllers: IController[] = Object.values(this._controllers);
    for (let i = 0; i < controllers.length; i += 1){
      const actionType = controllers[i];
      if (actionType?.viewerUpdate) {
        actionType.viewerUpdate(this);
      }
    }
  }

  protected _verifyLoaded() {
    if (this._state === 'loading') {
      const notReadyYet = new Error('start or stop before finished loading')
      console.error(notReadyYet);
      return false
    }
    return true;
  }

  protected _startOrStop(type?: 'start' | 'stop') {
    if (!this._verifyLoaded()) {
      return;
    }

    if (this._viewMode === 'Screener') {
      /* const screenerAction = this.screenerTrack.actionRef;
      if (type === 'start' && screenerAction?.controller?.start && !this.screenerTrack.hidden) {
        screenerAction.controller.start({action: screenerAction, time: this.getTime(), engine: this});
      } else if (type === 'stop' && screenerAction?.controller?.stop && !this.screenerTrack.hidden) {
        screenerAction.controller.stop({action: screenerAction, time: this.getTime(), engine: this});
      } */
    } else {
      // eslint-disable-next-line no-restricted-syntax
      this._activeIds.forEach((key, ) => {
        const action = this._actionMap[key];
        const track = this._actionTrackMap[action.id];
        if (type === 'start' && track?.controller?.start && !track.hidden) {
          track.controller.start({action, time: this.getTime(), engine: this as IEngine});
        } else if (type === 'stop' && track?.controller?.stop && !track.hidden) {
          track.controller.stop({action, time: this.getTime(), engine: this as IEngine});
        }
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
   log(msg: string, ctx?: string) {
    if (!this._logging) {
      return;
    }
    let finalMsg = `${this.getTime().toFixed(3)} - ${msg}`;
    if (ctx) {
      finalMsg = `${finalMsg} [${ctx}]`
    }
    console.info(finalMsg)
  }

  /** Execute every frame */
  protected _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (!this._verifyLoaded()) {
      return;
    }

    if (this.isPaused) {
      return;
    }

    this.log('tick')
    const { now, autoEnd = true, to } = data;

    const initialTime = this.getTime();
    // Calculate the current time
    let currentTime = initialTime + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
    currentTime = Math.max(0, currentTime);
    this._prev = now;


    // Set the current time
    if (to && to <= currentTime) {
      currentTime = to;
    }

    this.setTime(currentTime, true);

    // Execute action
    this.tickAction(currentTime);
    // In the case of automatic stop, determine whether all actions have been executed.
    if (!to && autoEnd && this._next >= this._actionSortIds.length && this._activeIds.length === 0) {
      this._end();
      return;
    }
    if (initialTime > currentTime && currentTime === 0) {
      this._end();
      return;
    }

    // Determine whether to terminate
    if (to && to <= currentTime) {
      this._end();
    }

    if (this.isPaused) {
      return;
    }
    this._timerId = requestAnimationFrame((time) => {
      this.log('requestAnimationFrame')
      this._tick({ now: time, autoEnd, to });
    });
  }

  /** tick runs actions */
  tickAction(time: number) {
    if (!this._verifyLoaded() || !this._renderCtx || (this.detailMode === true && !this.renderDetailCtx)) {
      return;
    }
    this.log('tickAction')

    if (this.detailMode) {
      this.renderDetailCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight);
    } else {
      this.renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }

    this._dealEnter(time);
    this._dealLeave(time);

    // render

    // eslint-disable-next-line no-restricted-syntax
    this._activeIds.forEach((key, ) => {
      const action = this._actionMap[key];
      const track = this._actionTrackMap[action.id];
      if (track.controller && track.controller?.update) {
        track.controller.update({action, time: this.getTime(), engine: this as IEngine});
      }
    });

    this.log('_tickAction', 'postUpdate')
    // console.log(renderPass.join(' => '));
  }

  setScrollLeft(left: number) {
    this.trigger('setScrollLeft', { left, engine: this as IEngine });
  }

  drawImage(dd: DrawData) {
    if (this.detailMode) {
      this.renderDetailCtx?.drawImage(dd.source, dd.sx, dd.sy, dd.sWidth, dd.sHeight, dd.dx ?? 0, dd.dy ?? 0, dd.dWidth ?? 1920, dd.dHeight ?? 1080);
    } else {
      this.renderCtx?.drawImage(dd.source, dd.sx, dd.sy, dd.sWidth, dd.sHeight, dd.dx ?? 0, dd.dy ?? 0, dd.dWidth ?? 1920, dd.dHeight ?? 1080);
    }
  }

  /** Reset active data */
  protected _dealClear() {
    while (this._activeIds.length > 0) {
      const minKey = this._activeIds.minKey(); // Get the smallest entry in the BTree
      if (minKey !== undefined) {
        const action = Object.values(this._actionMap)[minKey];
        // console.log(`Deleting Key: ${minKey}, Value: ${action}`);
        this._activeIds.delete(minKey); // Delete the current smallest key

        if (action) {
          const track = this._actionTrackMap[action.id];
          const controller = track.controller;
          if (controller?.leave) {
            controller.leave({action, time: this.getTime(), engine: this as IEngine});
          }
        }
      } else {
        this._activeIds.clear();
      }
    }
    this._next = 0;
  }

  /** Process action time enter */
  protected _dealEnter(time: number) {
    const active = Array.from(this._activeIds.values())
    // add to active
    while (this._actionSortIds[this._next]) {
      const actionId = this._actionSortIds[this._next];
      const action = this._actionMap[actionId];

      if (!action.disable) {
        // Determine whether the action start time has arrived

        if (action.start > time) {
          break;
        }
        const track = this._actionTrackMap[actionId];
        // The action can be executed and started
        if (action.end > time && active.indexOf(actionId) === -1 && !track.hidden) {
          const controller = track.controller;
          if (controller && controller?.enter) {
            controller.enter({action, time: this.getTime(), engine: this as IEngine});
          }

          this._activeIds.set(action.z, actionId);
        }
      }
      this._next += 1;
    }
  }

  /** Handle action time leave */
  protected _dealLeave(time: number) {
    this._activeIds.forEach(( key, value) => {

      const action = this._actionMap[key];

      if (action) {
        const track = this._actionTrackMap[action.id];

        // Not within the playback area or hidden
        if (action.start > time || action.end < time || track.hidden) {
          const controller = this._controllers[action.controllerName];

          if (controller && controller?.leave) {
            controller.leave({action, time: this.getTime(), engine: this as IEngine});
          }

          this._activeIds.delete(value);
        }
      }
    });
  }

  /** Data processing */
  protected _dealData(tracks: ITimelineTrack[]) {
    const actions: ITimelineAction[] = [];
    tracks?.forEach((track) => {
      if (track) {
        actions.push(...track.actions);
        track.actions.forEach((action) => {
          this._actionTrackMap[action.id] = track;
        })
      }
    });
    const sortActions = actions.sort((a, b) => a.start - b.start);
    const actionMap: Record<string, ITimelineAction> = {};
    const actionSortIds: string[] = [];

    sortActions.forEach((action) => {
      actionSortIds.push(action.id);
      actionMap[action.id] = { ...action };
    });
    this._actionMap = actionMap;
    this._actionSortIds = actionSortIds;
  }

  static parseCoord(
    coord: number | string,
    coordContext: number,
    sceneContext: number
  ): number {

    // Helper to evaluate calc expressions like 'calc(100% - 20px)'
    const evaluateCalc = (expression: string, localSize: number, sceneSize: number): number => {
      // Replace 'vw' and 'vh' with '100%' since they map to width and height in this context
      expression = expression.replace(/(\d+)vw/g, (_, value) => `${(parseFloat(value) / 100) * (sceneSize - localSize)}px`);

      // Replace percentage values with their evaluated numbers
      expression = expression.replace(/(\d+)%/g, (_, value) => `${(parseFloat(value) / 100) * (sceneSize - localSize)}`);

      // Use `eval` to compute the final expression
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      if (Number.isNaN(result)) {
        throw new Error(`Failed to evaluate calc expression: ${expression}`);
      }
      return result;
    };

    const parseValue = (value: number | string, localSize: number, sceneSize: number): number => {
      if (typeof value === 'number') {
        // If it's already a number, return it directly
        return value;
      }

      if (typeof value === 'string') {
        // Handle calc() values like 'calc(100% - 20px)'
        if (value.startsWith('calc(') && value.endsWith(')')) {
          const expression = value.slice(5, -1); // Extract the expression inside calc()
          return evaluateCalc(expression, localSize, sceneSize);
        }

        // Handle pixel values like '20px'
        if (value.endsWith('px')) {
          return parseFloat(value); // Convert the string to a number
        }

        // Handle percentage values like '50%'
        if (value.endsWith('%')) {
          const percentage = parseFloat(value) / 100;
          return (sceneSize - localSize) * percentage; // Calculate percentage of the total
        }
      }

      throw new Error(`Unsupported format for value: ${value}`);
    };

    return parseValue(coord, coordContext, sceneContext);
  }

  on<K extends keyof Events>(names: K | K[], handler: (args: Events[K]) => boolean | unknown): Emitter<Events> {
    this.emitter.on<K>(names, handler);
    return this.emitter;
  }

  trigger<K extends keyof Events>(name: K, params: Events[K]) {
    return this.emitter.trigger<K>(name, params);
  }

  bind(name: string) {
    this.emitter.bind(name);
  }

  exist(name: string) {
    return this.emitter.exist(name);
  }

  off<K extends keyof Events>(name: K, handler?: (args: Events[K]) => boolean | unknown) {
    this.emitter.off<K>(name, handler);
  }

  offAll() {
    this.emitter.offAll();
  }
}
