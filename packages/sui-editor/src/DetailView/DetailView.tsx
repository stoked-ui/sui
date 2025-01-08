import * as React from 'react';
import IconButton from "@mui/material/IconButton";
import { Close } from "@mui/icons-material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import { ActionDetail, TrackDetail } from '@stoked-ui/timeline';
import SettingsIcon from "@mui/icons-material/Settings";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import { useEditorContext } from '../EditorProvider/EditorContext';
import EditorState, {  getActionSelectionData } from '../EditorProvider/EditorState';
import { RootBox } from "./Detail";
import Controllers from "../Controllers";
import EditorProvider from "../EditorProvider";
import { DetailCombined } from './DetailCombined';
import EditorFile, {IEditorFile} from "../EditorFile";

const seen = new WeakSet();
const replacer = (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
  }
  return value;
};

interface DetailOutterProps {
  detailState: DetailState,
  onClose: () => void,
  setDetailEditorState: React.Dispatch<React.SetStateAction<EditorState | null>>
}

interface DetailState {
  selectedTrackId: string | undefined,
  selectedActionId: string | undefined,
  selectedId: string
}

export const DetailView = React.forwardRef(function DetailView(
  { detailState, onClose, setDetailEditorState }: DetailOutterProps, ref: React.Ref<HTMLDivElement>
) {
  const { state , dispatch } = useEditorContext();
  const { selected, selectedType, selectedAction, selectedTrack, selectedDetail } = state

  const { selectedTrackId, selectedActionId, selectedId } = detailState;
  const [initialized, setInitialized] = React.useState(false);
  const [currSelectedId, setCurrSelectedId] = React.useState('')

  React.useEffect(() => {
    setDetailEditorState(state);
  }, [state])

  React.useEffect(() => {
    const getSelectionData = () => {
      if (selectedActionId) {
        return getActionSelectionData(selectedActionId, state);
      }
      if (selectedTrackId) {
        const selectedIndex = state.file?.tracks.findIndex((track) => track.id === selectedTrackId);
        if (selectedIndex !== undefined && selectedIndex !== -1 && state.file?.tracks[selectedIndex]) {
          return { selectedTrack: state.file?.tracks[selectedIndex] };
        }
      }
      if (selectedId && state.file && selectedId === state.file.id) {
        return { selectedFile: state.file };
      }
      return {};
    }
    const selectionData: any = getSelectionData();
    if (selected?.id !== selectedId) {
      if (selectedActionId && 'selectedAction' in selectionData) {
        dispatch({ type: 'SELECT_ACTION', payload: selectionData.selectedAction });
        setCurrSelectedId(selectionData.selectedAction.id);
      } else if (selectedTrackId && 'selectedTrack' in selectionData) {
        dispatch({
          type: 'SELECT_TRACK',
          payload: selectionData.selectedTrack
        });
        setCurrSelectedId(selectionData.selectedTrack.id);
      } else if (selectedId && 'selectedFile' in selectionData) {
        dispatch({ type: 'SELECT_PROJECT' });
        setCurrSelectedId(selectionData.selectedFile.id);
      }
    }
  }, [])

  React.useEffect(() => {
    if (currSelectedId === ''){
      return;
    }
    if (selectedType === 'action' && selectedAction && (selectedDetail as ActionDetail).action.id !== selectedAction.id) {
      setCurrSelectedId(selectedAction.id);
      dispatch({ type: 'SELECT_ACTION',  payload: selectedAction });
    } else if (selectedType === 'track' && selectedTrack && (selectedDetail as TrackDetail).track.id !== selectedTrack.id) {
      setCurrSelectedId(selectedTrack.id);
      dispatch({ type: 'SELECT_TRACK',  payload: selectedTrack });
    } else if (selectedType === 'project' && state.file) {
      setCurrSelectedId(state.file.id);
      dispatch({ type: 'SELECT_PROJECT' });
    }
  }, [selected])

  const settingSwitch = () => {
    dispatch({ type: 'SELECT_SETTINGS' });
  }
   return (
    <Card
      component={RootBox}
      sx={(theme) => ({
        maxWidth: '850px',
        width: '800px',
        minWidth: '500px',
        borderRadius: '12px',
        position: 'relative',
        minHeight: '600px',
        maxHeight: 'calc(100vh - 40px)',
        display: 'flex',
        overflowY: 'auto',
        backgroundImage: `linear-gradient(168deg, rgba(0, 59, 117, 0.4108018207282913) 0%,  ${theme.palette.mode === 'dark' ? '#000' : '#FFF'} 100%)`,
        backgroundColor: '#c7def5',
        '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
          webkitTextFillColor: theme.palette.text.primary
        }
      })}>
      <CardContent sx={(theme) => ({
        gap: '0.8rem',
        padding: '6px 24px 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',

      })}>
        <Fab
          id={'settings'}
          color={'secondary'}
          aria-label="settings"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            right: '48px',
            margin: '8px',
          })}
          onClick={settingSwitch}
        >
          <SettingsIcon />
        </Fab>
        <Fab
          id={'close'}
          color={'info'}
          aria-label="close"
          size="small"
          sx={(theme) => ({
            position: 'absolute',
            right: '0px',
            margin: '8px',
          })}
          onClick={onClose}
        >
          <Close/>
        </Fab>
        <DetailCombined />
      </CardContent>
    </Card>
  );
});

function DetailModal () {
  const editorState = useEditorContext();
  const [initialized, setInitialized] = React.useState(false);
  const { state: {flags, file, selected, selectedAction, selectedTrack}, dispatch } = editorState;
  const [detailState, setDetailState] = React.useState<DetailState | null>(null);
  const [detailEditorState, setDetailEditorState] = React.useState<EditorState | null>(null);
  const [copiedFile, setCopiedFile] = React.useState<IEditorFile | null>(null);
  const onClose = () => {
    if (detailEditorState?.file) {
      dispatch({type: 'SET_FILE', payload: detailEditorState.file})
    }
    dispatch({ type: 'CLOSE_DETAIL',  });
    setInitialized(false);
  }

  React.useEffect(() => {
    if (flags.detailOpen && !initialized && file) {
      const newFile = new EditorFile({...file.data, files: file.files});
      newFile.preload('detail-editor').then(() => {
        setCopiedFile(newFile)
        setDetailState({ selectedTrackId: selectedTrack?.id, selectedActionId: selectedAction?.id, selectedId: selected!.id});
        setInitialized(true);
      })
    }
  }, [flags.detailOpen]);

  if (!detailState) {
    return undefined;
  }


  return (<Modal
    open={!!flags.detailOpen}
    onClose={onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    style={{ display: 'flex', alignItems: 'top', marginTop: '20px', marginBottom:'20px',  justifyContent: 'center' }}
  >
    <Box sx={{
      '&::visible-focus': {
        outline: 'none',
      },
      outline: 'none',
    }}>
      <EditorProvider file={copiedFile!} controllers={Controllers}>
          <DetailView onClose={onClose} detailState={detailState} setDetailEditorState={setDetailEditorState} />
      </EditorProvider>

{/*
      </DetailProvider>
*/}
    </Box>
  </Modal>)
}

DetailModal.flag = 'detailPopover';

export default DetailModal;
