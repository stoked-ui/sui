import {CSSProperties} from "@mui/system/CSSProperties";

declare global {
  interface Window {
    end: any
  }
}

/*

declare class Emitter<T> {
  on(event: T, listener: Function): void;
  off(event: T, listener: Function): void;
  emit(event: T, ...args: any[]): void;
}

declare class EventTypes {
  constructor();

  play: string;

  pause: string;

  timeupdate: string;

  scroll: string;

  reRender: string;
}

declare interface ITimelineTrack {
  id: string
  name?: string
  actions: ITimelineAction[]
  rowHeight?: number
  selected?: boolean
  classNames?: string[]
  hidden?: boolean
  lock?: boolean
}


declare interface ITimelineAction {
  selected?: boolean;
  flexible?: boolean;
  movable?: boolean;
  disable?: boolean;
  /!** Action id *!/
  id: string;
  /!** Action display name *!/
  name?: string;
  /!** Action start time *!/
  start: number;
  /!** Action end time *!/
  end: number;
  /!** Minimum start time limit for actions *!/
  minStart?: number;
  /!** Maximum end time limit of action *!/
  maxEnd?: number;
  onKeyDown?: (event: any, id: string) => void;
  data?: {
    src: string;
    style?: CSSProperties;
  };
  getBackgroundImage?: (actionType: any, src: string) => string;
}

*/

export {};
