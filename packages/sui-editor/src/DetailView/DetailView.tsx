import * as React from 'react';
import {ITimelineTrack, ITimelineAction, IEngine, ITimelineFile, useTimeline } from "@stoked-ui/timeline";
import {
  Popover, Card, CardContent, styled, Button, CardActions, Breadcrumbs, Link, Typography
} from '@mui/material';
import {DetailViewProps, getFormSchema} from "./DetailView.types";
import DetailTrackView from './DetailTrackView';
import DetailVideoView from './DetailVideoView';
import {getFormData, IDetailData, DetailSelection, SubmitSignature} from "./Detail";
import EditorFile from "../Editor/EditorFile";
import {EditorPopover} from "../Editor/Editor.styled";
import { useEditorContext } from '../EditorProvider/EditorProvider';
import {IEditorAction} from "../EditorAction/EditorAction";

function DetailType(props){
  const { detail } = props;
  if (detail.track) {
    return <DetailTrackView {...props} />;
  }
  return <DetailVideoView {...props} />;
}

function getInput(props: { file: ITimelineFile, engine: IEngine, selected: ITimelineTrack | IEditorAction | ITimelineFile }): DetailSelection {
  const { engine, file: video } = props;
  let { selected } = props;
  if (selected === null) {
    selected = new EditorFile({name: 'new video'});
  }
  if ("actions" in selected) {
    const {file, ...track } = selected as ITimelineTrack;
    return {
      video,
      track,
      selectedFile: file,
      action: undefined }
  }
  if ("getBackgroundImage" in selected) {
    const {file, ...track } = engine.getActionTrack(selected.id);
    return {
      video,
      track,
      selectedFile: file,
      action: selected as IEditorAction
    }
  }
  return {
    video,
    track: undefined,
    selectedFile: undefined,
    action: undefined
  }
}

function DetailView(inProps: DetailViewProps,) {
  const { detailAnchor, selectedAction, selectedTrack, file, engine, dispatch } = useEditorContext();
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  if (engine) {
    engine.detailMode = true;
  }

  const onClickEdit = (event: Event) => {
    if (!editMode) {
      setEditMode(true);
    }
    // event.preventDefault();
    event.stopPropagation();
  }
  const getSelection = () => {
    if (selectedAction) {
      return selectedAction;
    }
    if (selectedTrack) {
      return selectedTrack;
    }
    return file!;
  }

  const [detail, setDetail] = React.useState<DetailSelection>(getInput({ selected: getSelection(), engine, file: (file as ITimelineFile) }));
  const [formData, setFormData] = React.useState<IDetailData>(getFormData(detail, file?.tracks ?? []));

  React.useEffect(() => {
    if (file) {
      setDetail(getInput({selected: getSelection(), engine, file}));
      setFormData(getFormData(detail, file.tracks ?? []));
    }
  }, [selectedTrack, selectedAction])


  const schema = getFormSchema();

  const commonProps = {
    tracks: file?.tracks ?? [],
    setEditMode,
    editMode,
    engine,
    onClickEdit,
    formRef,
    detail,
    setDetail,
    formData,
    setFormData,
    schema,
  };

  return (
    <EditorPopover
      open={!!detailAnchor}
    >
      <DetailType {...commonProps} formData={formData} detail={detail} />
    </EditorPopover>);
}

export default DetailView;
