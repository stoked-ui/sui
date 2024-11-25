import * as React from "react";
import {
  FormWrap, useEditMode,
} from './Detail'
import {
} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";
import BlendModeSelect from "./BlendModeSelect";
import {DetailTrack} from "./DetailTrack";
import {DetailAction} from "./DetailAction";
import {DetailProject} from "./DetailProject";

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

export function DetailCombined() {
  const {selectedType, selectedDetail, settings, selected } = useEditorContext();
  const [editMode, setEditMode] = React.useState(true);
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

  return (
    <FormWrap
      onSubmit={settings.detailSubmit}
      handleSubmit={settings.detailHandleSubmit}
      title={selected?.name}
    >
      {isTrack && <DetailTrack detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isAction &&  <DetailAction detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isProject && <DetailProject detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
    </FormWrap>
  )
}
