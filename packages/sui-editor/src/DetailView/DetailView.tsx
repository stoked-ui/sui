import * as React from 'react';
import IconButton from "@mui/material/IconButton";
import { Close } from "@mui/icons-material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Modal from "@mui/material/Modal";
import { DetailDataAction, DetailDataProject, DetailDataTrack } from "./Detail.types";
import { DetailTrack } from './DetailTrack';
import { useEditorContext } from '../EditorProvider/EditorContext';
import { DetailProject } from './DetailProject';
import { DetailAction } from './DetailAction';
import { RootBox } from "./Detail";
import DetailProvider, { useDetail } from "./DetailProvider";
import { IEditorFile } from "../EditorFile/EditorFile";

export const DetailView = React.forwardRef(function DetailView({ onClose }: { onClose: () => void}, ref: React.Ref<HTMLDivElement>) {
  const { detail, dispatch } = useDetail();

  return (
    <div style={{ position: 'relative'}}>
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
          backgroundColor: theme.palette.background.default
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
          {(() => {
            switch (detail.type) {
              case 'track':
                return  <DetailTrack data={detail as DetailDataTrack}/>
              case 'action':
                return <DetailAction  data={detail as DetailDataAction}/>
              case 'project':
                return <DetailProject data={detail as DetailDataProject}/>
              default:
                return null
            }
          })()}
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

  if (!file) {
    return undefined;
  }
  return (<Modal
    open={!!detailOpen}
    onClose={onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <DetailProvider file={file as IEditorFile} detailRendererRef={detailRendererRef} selectedActionId={selectedAction?.id} selectedTrackId={selectedTrack?.id}>
      <DetailView onClose={onClose} />
    </DetailProvider>
  </Modal>)
}

DetailModal.flag = 'detailPopover';

export default DetailModal;
