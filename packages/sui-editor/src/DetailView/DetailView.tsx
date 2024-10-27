import * as React from 'react';
import {ITimelineTrack, ITimelineAction, IEngine, ITimelineFile, useTimeline } from "@stoked-ui/timeline";
import {
  Popover, Card, CardContent, styled, Button, CardActions, Breadcrumbs, Link, Typography
} from '@mui/material';
import {DetailViewProps, getFormSchema} from "./DetailView.types";
import DetailTrackView from './DetailTrackView';
import DetailVideoView from './DetailVideoView';
import {getFormData, IDetailData, DetailSelection, SubmitSignature} from "./Detail";
import DetailActionView from './DetailActionView';

const DetailPopover = styled(Popover, {
  name: 'MuiFileDetail',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => {
  return {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

function DetailType(props){
  const { detail } = props;
  if (detail.action) {
    return <DetailActionView {...props} />
  }
  if (detail.track) {
    return <DetailTrackView {...props} />;
  }
  return <DetailVideoView {...props} />;
}

function getInput(props: { file: ITimelineFile, engine: IEngine, selected: ITimelineTrack | ITimelineAction | ITimelineFile }): DetailSelection {
  const { selected, engine, file } = props;
  if ("actions" in selected) {
    const track = selected as ITimelineTrack;
    return {
      video: (file as ITimelineFile),
      track,
      selectedFile: track.file,
      action: undefined }
  }
  if ("getBackgroundImage" in selected) {
    const track = engine.getActionTrack(selected.id);
    return {
      video: (file as ITimelineFile),
      track,
      selectedFile: track.file,
      action: selected as ITimelineAction
    }
  }
  return {
    video: (selected as ITimelineFile),
    track: undefined,
    selectedFile: undefined,
    action: undefined
  }
}

const DetailView = React.forwardRef(function DetailView(
  inProps: DetailViewProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { selectedAction, selectedTrack, file, engine } = useTimeline();
  const { anchorEl, onClose } = inProps;
  const open = Boolean(anchorEl);
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
    return file;
  }

  const [detail, setDetail] = React.useState<DetailSelection>(getInput({ selected: getSelection(), engine, file }));
  const [formData, setFormData] = React.useState<IDetailData>(getFormData(detail, file.tracks ?? []));

  React.useEffect(() => {
    setDetail(getInput({ selected: getSelection(), engine, file }));
    setFormData(getFormData(detail, file.tracks ?? []));
  }, [selectedTrack, selectedAction])


  const schema = getFormSchema();
  const commonProps = {
    tracks: file.tracks ?? [],
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
    onClose: inProps.onClose
  };

  return (
    <DetailPopover
      ref={ref}
      open={open}
      anchorEl={anchorEl}
      onClose={(event, reason) => {
        engine.detailMode = false;
        onClose(event, reason);
      }}
      anchorReference={'none'}
    >
      <DetailType {...commonProps} formData={formData} detail={detail} />
    </DetailPopover>);
})

export default DetailView;
