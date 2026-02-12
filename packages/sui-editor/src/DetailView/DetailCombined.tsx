import * as React from "react";
import {useEditorContext} from "../EditorProvider";
import {DetailTrack} from "./DetailTrack";
import {DetailAction} from "./DetailAction";
import {DetailProject} from "./DetailProject";
import {DetailSettings} from "./DetailSettings";

export function DetailCombined() {
  const { state: {selectedType, selectedDetail} } = useEditorContext();
  const [editMode, setEditMode] = React.useState(false);
  const enableEdit = () => {
    console.info('edit mode: enabled');
    setEditMode(true);
  }
  const disableEdit = () => {
    console.info('edit mode: disabled');
    setEditMode(false);
  }

  const isAction = selectedType === 'action';
  const isTrack = selectedType === 'track';
  const isProject = selectedType === 'project';
  const isSettings = selectedType === 'settings';

  return (
    <React.Fragment>
      {isTrack && <DetailTrack detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isAction &&  <DetailAction detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isProject && <DetailProject detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isSettings && <DetailSettings detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
    </React.Fragment>
  )
}
