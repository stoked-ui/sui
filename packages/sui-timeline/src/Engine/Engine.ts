import * as React from 'react';
import BTree from "sorted-btree";
import {namedId, getFileName, MediaFile} from "@stoked-ui/media-selector";
import { type ITimelineAction, type ITimelineActionInput } from '../TimelineAction/TimelineAction.types'
import { type IController } from './Controller.types';
import {type IEngine, type PlayState, ScreenerBlob, type ViewMode} from './Engine.types';
import { type ITimelineTrack} from '../TimelineTrack/TimelineTrack.types';
import {Events, type EventTypes} from './events'
import {Emitter} from './emitter'

const PLAYING = 'playing';
const PAUSED = 'paused';


export type EngineOptions = {
  viewer?: HTMLElement;
  id: string;
  controllers?: Record<string, IController>;
  events?: any;
  defaultState: string;
}

/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Emitter<EventTypes>}
 */
export default class Engine<State extends PlayState = PlayState, Events extends EventTypes = EventTypes> extends Emitter<Events> implements IEngine {

  protected _viewer: HTMLElement | null = null;

  protected _renderer: HTMLCanvasElement | null = null;

  protected  _renderWidth: number = 0;

  protected _renderHeight: number = 0;

  protected _screener: HTMLVideoElement | null = null;

  protected _screenerBlob: ScreenerBlob | null = null;

  protected _screenerTrack: ITimelineTrack | null = null;

  protected _stage: HTMLDivElement | null = null;

  protected _renderCtx: CanvasRenderingContext2D | null = null

  protected _alphaMode: boolean = false;

  protected _logging: boolean = true;

  setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[]>> | undefined = undefined;

  setScreenerTrack: React.Dispatch<React.SetStateAction<ITimelineTrack>> | undefined = undefined;

  constructor(params: EngineOptions ) {
    super(params.events || new Events());
    this._editorId = params.id;
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }
    this._playState = params.defaultState as State;
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

  get screenerTrack() {
    return this._screenerTrack;
  }

  set screenerTrack(track: ITimelineTrack) {
    this._screenerTrack = track;
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

  set action(action: ITimelineAction) {
    this._actionMap[action.id] = action;
    const track = this._actionTrackMap[action.id];
    this.setTracks?.((prev) => {
      return prev.map((prevTrack) => {
        if (track.id === prevTrack.id) {
          const actionIndex = track.actions.indexOf(action);
          prevTrack.actions[actionIndex] = action;
        }
        return {...prevTrack, actions: [...prevTrack.actions] }
      })
    })
  }

  get action(): ITimelineAction | undefined {
    const vals = Object.values(this._actionMap)
    if (vals.length) {
      return vals[0];
    }
    return undefined;
  }

  set alpha(enabled: boolean) {
   /*  if (enabled === this._alphaMode) {
      return;
    }

    const ctx = this._renderer.getContext('2d', { alpha: true, willReadFrequently: true });
    if (ctx) {
      this._renderCtx = ctx;
      this._renderCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }
    this._alphaMode = enabled; */
  }

  get alpha() {
    return this._alphaMode;
  }

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    const renderer = viewer.querySelector(`#${this._editorId} div[role='renderer']`) as HTMLCanvasElement;
    this._screener = viewer.querySelector(`#${this._editorId} video[role='screener']`) as HTMLVideoElement;
    this._stage = viewer.querySelector(`#${this._editorId} div[role='stage']`) as HTMLDivElement;
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
      this._loading = false;
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

  _editorId: string;

  protected _loading = true;

  /** requestAnimationFrame timerId */
  protected _timerId: number = 0;

  /** Playback rate */
  protected _playRate = 1;

  /** current time */
  protected _currentTime: number = 0;

  /** Playback status */
  protected _playState: State;

  protected _viewMode: ViewMode;

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
    if (viewMode === 'Screener' && !this.screenerTrack) {
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
    }
    this._viewMode = viewMode;
  }

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
    return this._loading;
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._playState === 'playing';
  }

  /** Whether it is paused */
  get isPaused() {
    return this._playState === 'paused';
  }

  set controllers(controllers: Record<string, IController>) {
    this._controllers = controllers;
    this.logging = this._logging;
  }

  set tracks(tracks: ITimelineTrack[]) {
    // if (this.isPlaying) {
    //  this.pause();
    // }
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  async buildScreenerTrack(controller: IController, actionInput: ITimelineActionInput): Promise<ITimelineTrack> {
    try {
      const action = actionInput as ITimelineAction;
      action.src = action.src.indexOf('http') !== -1 ? action!.src : `${window.location.href}${action!.src}`;
      action.src = action.src.replace(/([^:]\/)\/+/g, "$1");
      action.fullName =  action.name;

      if (!action.id) {
        action.id = namedId('mediaFile');
      }
      action.timeUpdate = (time: number) => {
        this.setTime(time, true);
      }
      action.controller = controller;

      const preload = action.controller.preload ? await action.controller.preload({action, engine: this }) : action;

      action.end = preload.duration;
      action.file = await MediaFile.fromAction(preload as any);

      const trackGenId = namedId('track')
      return {
        id: trackGenId,
        name: action.name ?? trackGenId,
        actions: [action],
        actionRef: action,
        lock: false,
        hidden: false,
      } as ITimelineTrack;
    } catch (ex) {
      console.error('buildTracks:', ex);
      throw new Error(ex);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async buildTracks(controllers: Record<string, IController>, actionData: ITimelineActionInput[]): Promise<ITimelineTrack[]> {
    try {
      if (actionData) {
        const actions = actionData.map((actionInput, index) => {
          const action = actionInput as ITimelineAction;
          action.src = action.src.indexOf('http') !== -1 ? action!.src : `${window.location.origin}${action!.src}`;
          action.src = action.src.replace(/([^:]\/)\/+/g, "$1");
          if (!action.name) {
            const fullName = getFileName(action.src);
            const name = getFileName(action.src, false);
            if (!name || !fullName) {
              throw new Error('no action name available');
            }
            action.name = name;
            action.fullName = fullName;
          } else {
            action.fullName = getFileName(action.name, true)!;
            action.name = getFileName(action.name, false)!;
          }

          action.controller = controllers[action.controllerName];

          if (!action.id) {
            action.id = namedId('mediaFile');
          }
          if (!action.z) {
            action.z = index;
          } else {
            action.staticZ = true;
          }

          if (!action.layer) {
            action.layer = 'foreground';
          }
          return action;
        })
        const preload = actions.map((action) => action.controller.preload ? action.controller.preload({action, engine: this }) : action)
        const loadedActions = await Promise.all(preload);

        const filePromises = loadedActions.map((action) => MediaFile.fromAction(action as any));
        const mediaFiles: MediaFile[] = await Promise.all(filePromises);
        const tracks = mediaFiles.map((file) => {
          const loadedAction = loadedActions.find((a) => a!.fullName === file.path);
          if (!loadedAction) {
            throw new Error(`Action input not found for file ${JSON.stringify(file, null, 2)} - ${file.path} - ${loadedActions.map((act) => act.fullName)}`);
          }
          if (loadedAction.x) {
            loadedAction.x = Engine.parseCoord(loadedAction.x, loadedAction.width, this.renderWidth);
          } else {
            loadedAction.x = 0;
          }
          if (loadedAction.y) {
            loadedAction.y = Engine.parseCoord(loadedAction.y, loadedAction.height, this.renderHeight);
          } else {
            loadedAction.y = 0;
          }
          const action = {
            fit: 'none',
            alpha: false,
            loop: true,
            ...loadedAction,
            file,
            src: loadedAction.src,
            id: loadedAction.id,
          } as ITimelineAction
          const trackGenId = namedId('track')
          return {
            id: trackGenId,
            name: action.name ?? trackGenId,
            actions: [action],
            actionRef: action,
            hidden: false,
            lock: false
          } as ITimelineTrack;
        })
        return tracks;
      }
      return [];
    } catch (ex) {
      console.error('buildTracks:', ex);
      return [];
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
    const result = this.trigger('beforeSetPlayRate', { rate, engine: this });
    if (!result) {
      return false;
    }
    this._playRate = rate;
    this.trigger('afterSetPlayRate', { rate, engine: this });

    return true;
  }

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
    this._tickAction(this._currentTime);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof Engine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) {
      return false;
    }
    if (this._viewMode === 'Renderer') {
      this._currentTime = time;
    } else {
      this._screener.currentTime = time;
    }

    this._next = 0;
    this._dealLeave(time);
    this._dealEnter(time);

    if (isTick) {
      this.trigger('setTimeByTick', { time, engine: this });
    }
    else {
      this.trigger('afterSetTime', { time, engine: this });
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
    this._playState = PLAYING as State;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play', { engine: this });
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
      const previousState: State = this._playState;
      this._playState = PAUSED as State;

      if (this._viewMode === 'Screener') {
        this._screener.pause();
        return;
      }

      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused', { engine: this, previousState });
    }
    cancelAnimationFrame(this._timerId);
  }

  /** Playback completed */
  protected _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }

  protected _assignElements() {
    const getEditorRole = (role: string) => {
      return document.querySelector(`#${this._editorId} [role=${role}]`)
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
    if (this.loading) {
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
      const screenerAction = this.screenerTrack.actionRef;
      if (type === 'start' && screenerAction?.controller?.start && !this.screenerTrack.hidden) {
        screenerAction.controller.start({action: screenerAction, time: this.getTime(), engine: this});
      } else if (type === 'stop' && screenerAction?.controller?.stop && !this.screenerTrack.hidden) {
        screenerAction.controller.stop({action: screenerAction, time: this.getTime(), engine: this});
      }
    } else {
      // eslint-disable-next-line no-restricted-syntax
      this._activeIds.forEach((key, ) => {
        const action = this._actionMap[key];
        const track = this._actionTrackMap[action.id];
        if (type === 'start' && action?.controller?.start && !track.hidden) {
          action.controller.start({action, time: this.getTime(), engine: this});
        } else if (type === 'stop' && action?.controller?.stop && !track.hidden) {
          action.controller.stop({action, time: this.getTime(), engine: this});
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
    this._tickAction(currentTime);
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
  protected _tickAction(time: number) {
    if (!this._verifyLoaded() || !this._renderCtx) {
      return;
    }
    this.log('_tickAction', 'clearRect')
    this.renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight);
    this._dealEnter(time);
    this._dealLeave(time);

    this.log('_tickAction', 'preUpdate')
    // render

    if (this.viewMode === 'Renderer') {
      // eslint-disable-next-line no-restricted-syntax
      /* this._activeIds.forEach((key, ) => {
        const action = this._actionMap[key];
        if (action.controller && action.controller?.update) {
          action.controller.update({action, time: this.getTime(), engine: this});
        }
      }); */
      this._activeIds.forEach((key, ) => {
        const action = this._actionMap[key];
        if (action.nextFrame) {
          const frameData = action.nextFrame;
          this._renderCtx.drawImage(frameData.source, frameData.sx, frameData.sy, frameData.sWidth, frameData.sHeight, frameData.dx, frameData.dy, frameData.dWidth, frameData.dHeight);
        }
      });


    } else {
      const screenerAction = this.screenerTrack.actionRef;
      screenerAction.controller.update({ action: screenerAction, time: this.getTime(), engine: this});
    }
    this.log('_tickAction', 'postUpdate')
    // console.log(renderPass.join(' => '));
  }

  setScrollLeft(left: number) {
    this.trigger('setScrollLeft', { left, engine: this });
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
          const controller = action.controller;
          if (controller?.leave) {
            controller.leave({action, time: this.getTime(), engine: this});
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
          const controller = action.controller;
          if (controller && controller?.enter) {
            controller.enter({action, time: this.getTime(), engine: this});
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
            controller.leave({action, time: this.getTime(), engine: this});
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
}
