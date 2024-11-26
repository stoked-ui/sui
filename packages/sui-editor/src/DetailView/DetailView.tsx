import * as React from 'react';
import IconButton from "@mui/material/IconButton";
import { Close } from "@mui/icons-material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import { useEditorContext } from '../EditorProvider/EditorContext';
import { RootBox } from "./Detail";
import {namedId} from "@stoked-ui/media-selector";
import Controllers from "../Controllers";
import EditorProvider from "../EditorProvider";
import { DetailCombined } from './DetailCombined';
import Box from "@mui/material/Box";
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
export const DetailView = React.forwardRef(function DetailView({ onClose }: { onClose: () => void}, ref: React.Ref<HTMLDivElement>) {

  return (
    <div style={{ position: 'relative', minWidth: '800px', minHeight: '600px', maxHeight: 'calc(100vh - 40px)'}}>
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
            WebkitTextFillColor: theme.palette.text.primary
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
  const { file, detailOpen, selectedAction, selectedTrack, dispatch } = editorState;
  const onClose = () => {
    dispatch({ type: 'CLOSE_DETAIL' });
  }
  const detailRendererRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (detailRendererRef.current) {
      dispatch({ type: 'SET_RENDERER', payload: detailRendererRef.current as HTMLCanvasElement });
    }
  }, [detailRendererRef.current]);

  if (!file || !detailOpen) {
    return undefined;
  }
  return (<Modal
    open={!!detailOpen}
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
        <EditorProvider {...editorState} file={editorState.file ?? undefined} editorId={namedId('detail-editor')} controllers={Controllers}>
          <DetailView onClose={onClose} />
        </EditorProvider>
{/*
      </DetailProvider>
*/}
    </Box>
  </Modal>)
}

DetailModal.flag = 'detailPopover';

export default DetailModal;
