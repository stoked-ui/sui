import {
  TimelineContextType,
  TimelineState,
  refreshActionState as refreshTimelineActionState,
  refreshTrackState as refreshTimelineTrackState,
} from '@stoked-ui/timeline';
import {EditorEngineState, IEditorEngine} from "../EditorEngine";
import { IEditorFile } from '../EditorFile';
import {IEditorTrack} from "../EditorTrack";
import {IEditorAction} from "../EditorAction";

export default interface EditorState extends TimelineState<
  IEditorEngine,
  string | EditorEngineState,
  IEditorFile,
  IEditorTrack,
  IEditorAction
> { }

export const getActionSelectionData = (actionId: string, state: TimelineState) => {
  const { settings, file} = state;
  const tracks = file?.tracks ?? [];
  for (let i = 0; i < tracks.length; i += 1) {
    const t = tracks[i];
    const actionIndex = t.actions.findIndex((a) => a.id === actionId);
    if (actionIndex > -1) {
      settings.selectedTrackIndex = i;
      settings.selectedActionIndex = actionIndex;
      state = { ...state, settings, selectedTrack: {...tracks[state.settings.selectedTrackIndex]} };
      break;
    }
  }
  return state;
}

export const refreshActionState = (action: IEditorAction, track: IEditorTrack, state: EditorState) => {
  action = { ...action, ...refreshTimelineActionState(action, track, state)}
  action.dim = action.dim || track.hidden;
  return action;
}

export const refreshTrackState = (track: IEditorTrack, state: EditorState) => {
  const {actions: timelineActions, ...timelineTrack} = refreshTimelineTrackState(track, state);
  track = {
    ...track, ...timelineTrack,
  };
  track.dim = track.dim || track.hidden;

  if (track.hidden && track.file?.media?.element) {
    track.file.media.element.style.display = track.hidden ? 'none' : 'flex';
  }
  const actions = track.actions.map((action, index) => {
    return {...action, ...refreshActionState(action, track, state)}
  });
  return { ...track, actions }
}
