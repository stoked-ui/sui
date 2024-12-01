import * as React from 'react';
import IconButton from "@mui/material/IconButton";
import { Close } from "@mui/icons-material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import {namedId} from "@stoked-ui/media-selector";
import Box from "@mui/material/Box";
import { useEditorContext } from '../EditorProvider/EditorContext';
import {  getActionSelectionData } from '../EditorProvider/EditorState';
import { RootBox } from "./Detail";
import Controllers from "../Controllers";
import EditorProvider from "../EditorProvider";
import { DetailCombined } from './DetailCombined';

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
  onClose: () => void
}

interface DetailState {
  selectedTrackId: string | undefined,
  selectedActionId: string | undefined,
  selectedId: string
}

export const DetailView = React.forwardRef(function DetailView(
  { detailState, onClose }: DetailOutterProps, ref: React.Ref<HTMLDivElement>
) {
  const newEditorContext = useEditorContext();
  const { selected } = newEditorContext

  const { selectedTrackId, selectedActionId, selectedId } = detailState;

  React.useEffect(() => {
    if (selected?.id !== selectedId) {
      if (selectedActionId) {
        const actionSelectionData = getActionSelectionData(selectedActionId, newEditorContext);
        if (actionSelectionData.selectedAction) {
          newEditorContext.dispatch({
            type: 'SELECT_ACTION',
            payload: actionSelectionData.selectedAction
          });
        }
      } else if (selectedTrackId) {
        const selectedIndex = newEditorContext.file?.tracks.findIndex((track) => track.id === selectedTrackId);
        if (selectedIndex !== undefined && selectedIndex !== -1 && newEditorContext.file?.tracks[selectedIndex]) {
          newEditorContext.dispatch({
            type: 'SELECT_TRACK',
            payload: newEditorContext.file?.tracks[selectedIndex]
          });
        }
      }
    }
  }, [])

   return (
      <div style={{ position: 'relative',  minHeight: '600px', maxHeight: 'calc(100vh - 40px)', display: 'flex'}}>
        <IconButton
          sx={{
            position: 'absolute',
            top: 0,
            right: 0
          }}
          onClick={onClose}
        >
          <Close/>
        </IconButton>
        <Card
          component={RootBox}
          sx={(theme) => ({
            maxWidth: '850px',
            width: '800px',
            minWidth: '500px',
            backgroundColor: theme.palette.background.default,
          })}>
          <CardContent sx={(theme) => ({
            gap: '0.8rem',
            padding: '6px 24px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            background: `linear-gradient(168deg, rgba(0, 59, 117, 0.4108018207282913) 0%,  ${theme.palette.mode === 'dark' ? '#000' : '#FFF'} 100%)`,
            '& .MuiFormControl-root .MuiInputBase-root .MuiInputBase-input': {
              webkitTextFillColor: theme.palette.text.primary
            }
          })}>
            <DetailCombined />
          </CardContent>
        </Card>
      </div>
  );
});

function DetailModal () {
  const editorState = useEditorContext();
  const [initialized, setInitialized] = React.useState(false);
  const { flags, settings, selected, selectedAction, selectedTrack, dispatch } = editorState;
  const [detailState, setDetailState] = React.useState<DetailState | null>(null);

  const onClose = () => {
    dispatch({ type: 'CLOSE_DETAIL' });
  }

  React.useEffect(() => {
    if (flags.detailOpen && !initialized) {
      setDetailState({ selectedTrackId: selectedTrack?.id, selectedActionId: selectedAction?.id, selectedId: selected!.id});
      setInitialized(true);
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
      <EditorProvider file={editorState.file ?? undefined} controllers={Controllers}>
          <DetailView onClose={onClose} detailState={detailState} />
      </EditorProvider>

{/*
      </DetailProvider>
*/}
    </Box>
  </Modal>)
}

DetailModal.flag = 'detailPopover';

export default DetailModal;
