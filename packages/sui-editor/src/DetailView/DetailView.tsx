import * as React from 'react';
import {
  DetailViewProps,
  FormInfo,
  getTrackFormData,
  getActionFormData, getFileFormData, getFormSchema
} from "./DetailView.types";
import DetailTrackView from './DetailTrackView';
import DetailVideoView from './DetailVideoView';
import {IDetailData, DetailSelection, SubmitSignature} from "./Detail";
import EditorFile, { IEditorFile } from "../Editor/EditorFile";
import {EditorPopover} from "../Editor/Editor.styled";
import { useEditorContext } from '../EditorProvider/EditorProvider';
import {IEditorAction} from "../EditorAction/EditorAction";
import { getVideoFormData } from "./DetailVideoView.types";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { IEditorEngine } from "../EditorEngine";

function DetailType(props){
  const { detail } = props;
  if (detail.track) {
    return <DetailTrackView {...props} />;
  }
  return <DetailVideoView {...props} />;
}

function getInput(props: { video: IEditorFile, engine?: IEditorEngine, selected?: IEditorTrack | IEditorAction | IEditorFile }): DetailSelection {
  const { engine, video, selected} = props;

  if (!engine) {
    throw new Error('Engine is required for detail view');
  }

  if (!video) {
    throw new Error('Video is required for detail view');
  }

  if ("actions" in selected!) {
    const track = selected as IEditorTrack;
    return {
      video,
      track,
      action: undefined
    }
  }
  if ("volume" in selected!) {
    const track = props.engine?.getActionTrack(selected.id) as IEditorTrack;
    if (!track) {
      console.error('Track not found for action (this should not happen)', selected);
      throw new Error('Track not found for action');
    }
    return {
      video,
      track: track!,
      action: selected as IEditorAction
    }
  }
  return {
    video,
    track: undefined,
    action: undefined
  }
}


function DetailView(inProps: DetailViewProps,) {
  const { selectedAction, selectedTrack, file, engine, dispatch } = useEditorContext();

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

  const getFormData = (detail: DetailSelection) => {
    if (selectedAction) {
      return {
        video: getVideoFormData(detail),
        track: getTrackFormData(detail),
        action: getActionFormData(detail),
        file: getFileFormData(detail)
      };
    }
    if (selectedTrack) {
      return {
        video: getVideoFormData(detail),
        track: getTrackFormData(detail),
        file: getFileFormData(detail)
      }
    }
    return {
      video: getVideoFormData(detail),
    }
  }

  const getData = (): FormInfo => {
    const input = { selected: getSelection(), engine, video: file! }
    const detail = getInput(input);
    const data = getFormData(detail)

    return {
      detail,
      data
    }
  }

  const [formInfo, setFormInfo] = React.useState<FormInfo>(getData());

  React.useEffect(() => {
    if (file) {
      setFormInfo(getData());
    }
  }, [file, formInfo.data, selectedTrack, selectedAction])

  const schema = getFormSchema();

  const commonProps = {
    tracks: file?.tracks ?? [],
    setEditMode,
    editMode,
    engine,
    onClickEdit,
    formRef,
    formInfo,
    setFormInfo,
    schema,
  };

  return (
    <EditorPopover
      name={'detail'}
    >
      <DetailType {...commonProps} />
    </EditorPopover>);
}

export default DetailView;
