import * as React from 'react';
import { FileState } from '@stoked-ui/timeline';
import {
  DetailData,
  IDetailAction,
  IDetailProject,
  IDetailTrack,
  Selection,
  setDetail
} from "./Detail.types";
import { IEditorAction } from "../EditorAction";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile } from "../EditorFile/EditorFile";
import { IEditorEngine } from '../EditorEngine/EditorEngine.types';


export interface IDetailState {
  selected: Selection;
  selectedTrack: IEditorTrack | null;
  selectedAction: IEditorAction | null;
  file: IEditorFile;
  detail: DetailData
  engine: IEditorEngine;
}

export interface IDetailStateUnselected extends Omit<IDetailState, 'detail' | 'selected'> {
  detail?: DetailData,
  selected?: Selection
}

type SelectActionPayload = {
  action: IEditorAction,
  track: IEditorTrack
};

export type DetailStateAction = {
  type: 'SELECT_ACTION' | 'ACTION_DETAIL',
  payload: SelectActionPayload,
} | {
  type: 'SELECT_TRACK' | 'TRACK_DETAIL';
  payload: IEditorTrack,
} | {
  type: 'SELECT_PROJECT' | 'PROJECT_DETAIL';
} | {
  type: 'UPDATE_PROJECT',
    payload: IDetailProject,
} | {
  type: 'UPDATE_ACTION',
    payload: IDetailAction,
} |{
  type: 'UPDATE_TRACK',
    payload: IDetailTrack,
} ;

export type DetailContextType = IDetailState & {
  dispatch: React.Dispatch<DetailStateAction>;
  detailRendererRef: React.RefObject<HTMLCanvasElement>;
};

export const DetailContext = React.createContext<DetailContextType | undefined>(undefined);

export function DetailReducer(state: IDetailState, stateAction: DetailStateAction): IDetailState {
  switch (stateAction.type) {
    case 'SELECT_ACTION':{
      return setDetail<IDetailState>({
        ...state,
        selected: stateAction.payload.action,
      });
    }
    case 'SELECT_TRACK':{
      return setDetail<IDetailState>({
        ...state,
        selectedAction: null,
        selectedTrack: stateAction.payload,
        selected: stateAction.payload,
      });
    }
    case 'SELECT_PROJECT':{
      return setDetail<IDetailState>({
        ...state,
        selectedAction: null,
        selectedTrack: null,
        selected: state.file as Selection,
      });
    }
    case 'UPDATE_PROJECT':{
      let file: any = null;
      if (state.file) {
        file = stateAction.payload as IEditorFile
      }
      return {
        ...state,
        file
      }
    }
    case 'UPDATE_ACTION': {
      const { file } = state;
      if (!file) {
        return state;
      }
      const action = { ...state.selectedAction, ...stateAction.payload };

      file.tracks = state.file?.tracks.map((track) => {
        if (track.id === state.selectedTrack?.id) {
          return { ...track, actions: track.actions.map((a) => {
              const ret = a.id === action.id ? action : a;
              ret.fit = ret.fit || 'none';
              return ret;
            }) };
        }
        return track;
      }) as IEditorTrack<IEditorAction>[];

      return {
        ...state, file
      };
    }
    case 'UPDATE_TRACK': {
      const { file } = state;
      if (!file) {
        return state;
      }

      file.tracks = state.file?.tracks.map((currentTrack) => {
        if (currentTrack.id === state.selectedTrack?.id) {
          return { ...currentTrack, ...stateAction.payload };
        }
        return currentTrack;
      });

      return {
        ...state,
        file
      };
    }
    default:
      return state;
  }
}

export interface DetailProviderProps {
  file: IEditorFile,
  selectedActionId?: string,
  selectedTrackId?: string,
  children: React.ReactNode;
  detailRendererRef: React.RefObject<HTMLCanvasElement>;
}
