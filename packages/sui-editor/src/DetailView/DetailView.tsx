import * as React from 'react';
import IconButton from "@mui/material/IconButton";
import { Close } from "@mui/icons-material";
import Modal from "@mui/material/Modal";
import { DetailDataAction, DetailDataProject, DetailDataTrack } from "./Detail.types";
import { DetailTrack } from './DetailTrack';
import { useEditorContext } from '../EditorProvider/EditorContext';
import { closeModal } from '../Editor/Editor.styled';
import { DetailProject } from './DetailProject';
import { DetailAction } from './DetailAction';
import { Zettor } from "../EditorProvider/EditorProvider.types";


export const DetailView = React.forwardRef(function DetailView(inProps, ref: React.Ref<HTMLDivElement>) {
  const { detail, settings, selectedTrack, file, selectedAction, engine, dispatch } = useEditorContext();
  const [editor, setEditor] = React.useState(new Zettor('detailView-edit', dispatch))
  const props = {
    editor,
  }
  return (
    <div style={{ position: 'relative'}}>
      <IconButton
        sx={{
          position: 'absolute',
          top: 0,
          right: 0
        }}
        onClick={() => closeModal(dispatch, DetailModal.flag)}
      >
        <Close/>
      </IconButton>

      {(() => {
        switch (detail.type) {
          case 'track':
            return  <DetailTrack {...props} data={detail as DetailDataTrack}/>
          case 'action':
            return <DetailAction {...props} data={detail as DetailDataAction}/>
          case 'project':
            return <DetailProject {...props} data={detail as DetailDataProject}/>
          default:
            return null
        }
      })()}
    </div>
  );
});


function DetailModal () {
  const { flags, dispatch } = useEditorContext();
  return (<Modal
    open={flags.includes(DetailModal.flag)}
    onClose={() => closeModal(dispatch, 'detailPopover')}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    style={{display:'flex',alignItems:'center',justifyContent:'center'}}
  >
    <DetailView />
  </Modal>)
}

DetailModal.flag = 'detailPopover';

export default DetailModal;
