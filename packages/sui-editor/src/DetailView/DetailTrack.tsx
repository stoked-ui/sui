import * as React from "react";
import {Control, SubmitHandler, useForm, Resolver, ResolverOptions} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {ControlledTrack, ITimelineTrackDetail, TrackDetail, IFileDetail } from "@stoked-ui/timeline";
import ControlledText from "./ControlledText";
import {
  CtrlCell,
  CtrlRow,
  DetailActions,
  FormWrap,
  useEditMode,
} from './Detail'
import ControlledCheckbox from "./ControlledCheckbox";
import {
  DetailViewProps, IEditorActionDetail, IEditorProjectDetail, IEditorTrackDetail, trackSchema
} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";
import BlendModeSelect from "./BlendModeSelect";

export function DetailTrack(props: DetailViewProps) {
  const { state: {selectedTrack, selected}, dispatch } = useEditorContext();
  const {
    editMode,
    enableEdit,
    disableEdit
  } = props;

  const {
    control,
    handleSubmit: detailHandleSubmit,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<TrackDetail<IEditorProjectDetail, IEditorTrackDetail>>({
    defaultValues: props.detail as TrackDetail,
    resolver: yupResolver(trackSchema) as any,
  });

  const onSubmitTrack: SubmitHandler<ITimelineTrackDetail> = (submitData: ITimelineTrackDetail) => {
    disableEdit();
    dispatch({ type: 'UPDATE_TRACK', payload: submitData });
  };

  React.useEffect(() => {
    dispatch({ type: 'SET_SETTING', payload: {
        value: {
          detailSubmit: onSubmitTrack,
          detailHandleSubmit,
        }
      }})
  }, [])

  if (!selectedTrack) {
    return undefined;
  }

  return (
    <div>
      <CtrlRow>
        <CtrlCell width="45%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="30%">
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Hidden'}
            control={control}
            disabled={!editMode}
            onClickLabel={enableEdit}
            onClick={enableEdit}
          />
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Muted'}
            control={control}
            disabled={!editMode}
            onClickLabel={enableEdit}
            onClick={enableEdit}
          />
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Locked'}
            name={'locked'}
            control={control}
            disabled={!editMode}
            onClickLabel={enableEdit}
            onClick={enableEdit}
          />
        </CtrlCell>
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="40%">
          <BlendModeSelect onClickEdit={enableEdit} editMode={editMode} />
        </CtrlCell>
      </CtrlRow>
      <DetailActions errors={errors} isDirty={isDirty} reset={reset} disableEdit={disableEdit} editMode={editMode} />
    </div>
  )
}
