import {
  TimelineState,
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
