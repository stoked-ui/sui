import * as React from 'react';
import {
  DetailContext,
  DetailContextType,
  DetailProviderProps,
  DetailReducer,
  IDetailState
} from './DetailProvider.types';
import EditorFile, { IEditorFile, IEditorFileProps } from '../Editor/EditorFile';
import { IEditorFileTrack, IEditorTrack } from '../EditorTrack/EditorTrack';
import { IEditorAction, IEditorFileAction } from '../EditorAction/EditorAction';
import EditorEngine, { EditorEvents, IEditorEngine } from "../EditorEngine";
import Controllers from '../Controllers/Controllers';
import { DetailData, setDetail } from "./Detail.types";

export default function DetailProvider(props: DetailProviderProps) {
  const { detailRendererRef, file, children, selectedActionId, selectedTrackId }= props

  const newFile = new EditorFile(file.fileProps as IEditorFileProps<IEditorFileTrack>);
  const initialState = {
    file: newFile as IEditorFile,
    selected: newFile,
    selectedTrack: null as IEditorTrack | null,
    selectedAction: null as IEditorAction | null,
    engine:  new EditorEngine({ events: new EditorEvents(), controllers: Controllers }),
  }
  file?.tracks?.forEach((track: any) => {
    if (track.id === selectedTrackId) {
      initialState.selectedTrack = { ...track,
        blendMode: track.blendMode ?? 'normal',
        fit: track.fit ?? 'none'
      } as IEditorTrack;
    }
    track.actions.forEach((action) => {
      if (action.id === selectedActionId) {
        initialState.selectedAction = action;
      }
    });
  });
  const editorState = setDetail<IDetailState>(initialState);
  const [inputState, setInputState] = React.useState(editorState as IDetailState);
  const [state, dispatch] = React.useReducer(DetailReducer, inputState);

  return (
    <DetailContext.Provider value={React.useMemo(() => ({ ...state, dispatch, detailRendererRef }), [detailRendererRef, state, dispatch])} >
      {props.children}
    </DetailContext.Provider>
  );
}

// Custom hook to access the extended context
export function useDetail(): DetailContextType {
  const context = React.useContext(DetailContext);
  if (!context) {
    throw new Error("useDetail must be used within a DetailProvider");
  }
  return context;
}
