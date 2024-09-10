export interface MediaActionState {
  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is scalable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is prohibited from running */
  disable?: boolean;

  hidden?: boolean;
}

export interface MediaActionInput extends MediaActionState {
  /** action id */
  id?: string;
  /** action display name */
  name: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** The effectId corresponding to the action */
  effectId: string;

  data?: any;
}

/**
 *Basic parameters of the action
 * @export
 * @interface MediaAction
 */
export default interface MediaAction extends Omit<MediaActionInput, 'id' | 'name' | 'start' | 'end'> {
  /** action id */
  id: string;
  /** action display name */
  name?: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;

  file: File;

  /** Minimum start time limit for actions */
  minStart?: number;
  /** Maximum end time limit of action */
  maxEnd?: number;

  onKeyDown?: (event: any, id: string) => void;

  // getBackgroundImage?: (mediaController: IMediaController, src: string) => string;
}
