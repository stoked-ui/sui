import * as React from 'react';
import {shouldForwardProp} from "@mui/system/createStyled";
import _ from 'lodash';
import {alpha} from "@mui/material/styles";
import {ITimelineTrack, ITimelineAction, IEngine, ITimelineFile } from "@stoked-ui/timeline";
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

function getInput(props: { engine: IEngine, selected: ITimelineTrack | ITimelineAction | ITimelineFile }): DetailSelection {
  const { selected, engine } = props;
  if ("actions" in selected) {
    const track = selected as ITimelineTrack;
    return {
      video: (engine.file as ITimelineFile),
      track,
      selectedFile: track.actionRef.file,
      action: undefined }
  }
  if ("getBackgroundImage" in selected) {
    const track = engine.getActionTrack(selected.id);
    return {
      video: (engine.file as ITimelineFile),
      track,
      selectedFile: track.actionRef.file,
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
  const { engine, anchorEl, onClose, tracks } = inProps;
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

  const [detail, setDetail] = React.useState<DetailSelection>(getInput({ selected: engine.selected, engine }));
  const [formData, setFormData] = React.useState<IDetailData>(getFormData(detail, tracks));

  React.useEffect(() => {
    setDetail(getInput({ selected: engine.selected, engine }));
    setFormData(getFormData(detail, tracks));
  }, [engine.selected])


  const schema = getFormSchema();
  const commonProps = {
    tracks,
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
      onClose={() => {
        engine.detailMode = false;
        onClose();
      }}
      anchorReference={'none'}
    >
      <DetailType {...commonProps} formData={formData} detail={detail} />
    </DetailPopover>);
})

export default DetailView;
