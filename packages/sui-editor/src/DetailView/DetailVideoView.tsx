import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import { styled } from "@mui/material";
import Timeline, { TimelineControlProps, ITimelineFile, TimelineState, checkProps, ITimelineFileBase } from "@stoked-ui/timeline";
import ControlledText from "./ControlledText";
import {
  CtrlCell,
  CtrlColumn,
  CtrlRow, DetailSelection,
  DetailTypeProps,
  DetailViewBase
} from './Detail'
import Controllers from "../Controllers/Controllers";
import {EditorControls} from "../EditorControls";
import ControlledColor from "./ControlledColor";
import {useEditorContext} from "../EditorProvider";

const DetailRenderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer",
})(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  overflow: 'hidden',
  aspectRatio: `${16 / 9}`,
  borderRadius: '12px 12px 0px 0px',
  background: theme.palette.background.default,
  width: '100%',
  height: '100%'
}));

export default function DetailVideoView(props: DetailTypeProps) {
  const timelineState = React.useRef<TimelineState>(null);
  const { file, engine } = useEditorContext();
  const {
    detail,
    setEditMode,
    setDetail,
    editMode,
    formRef,
    onClickEdit,
    breadcrumbs,
    formData,
    setFormData,
    schema,
    onClose
  } = props;

  const useFormResult = useForm<ITimelineFileBase>({
    mode: 'onChange',
    defaultValues: formData.video,
    resolver: yupResolver(schema.video),
  });

  console.info('formData.video', formData.video)
  const {
    control,
    handleSubmit,
    getValues,
    register,
    unregister,
    formState: {
      isDirty,
      errors,
    },
    reset,
    trigger,
    setValue,
  } = useFormResult;

  // Form submit handler
  const onSubmit: SubmitHandler<ITimelineFile> = (detailVid: ITimelineFile) => {
    detailVid.lastModified = Date.now();
    setDetail((prev: DetailSelection) =>
      {
        return {
          ...prev,
          video: {...detailVid}
      }});
  };

  const detailViewBase = {
    title: file?.name ?? '',
    formName: 'video-detail',
    editMode,
    onClickEdit,
    handleSubmit,
    onSubmit,
    detail,
    setDetail,
    errors,
    control,
    formData,
    isDirty,
    reset,
    setEditMode,
    engine,
    onClose
  };

  const checkedProps = checkProps({} as TimelineControlProps);

  console.log('isDirty', isDirty, formData.video, );
  return (
    <DetailViewBase {...detailViewBase}>
      <CtrlColumn id={'detail-renderer-container'}>
        <DetailRenderer ata-preserve-aspect-ratio width={'1920'} sx={{ backgroundColor: `${formData.video.backgroundColor}!important` }}/>
        <EditorControls
          role={'controls'}
          {...engine.control.videoControlsProps}
          timeline
          switchView={false}
        />
        <Timeline
          role={'timeline'}
          {...engine.control.timelineProps}
          controllers={Controllers}
          timelineState={timelineState}
          labels
          detailMode
          locked
          disableDrag={true}
          viewSelector={`.MuiEditorView-root`}
          sx={{ width: '100%' }}
        />
      </CtrlColumn>
      <CtrlRow>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Description'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Author'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Created'}
            control={control}
            disabled={true}
            format={(epoch: number) => {
              if (epoch) {
                return new Date(epoch).toDateString();
              }
              return epoch;
            }}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Last Modified'}
            control={control}
            disabled={true}
            format={(epoch: number) => {
              if (epoch) {
                return new Date(epoch).toDateString();
              }
              return epoch;
            }}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledColor
            className={'whitespace-nowrap flex-grow flex'}
            label={'Background Color'}
            name={'backgroundColor'}
            type={'color'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
            label={'Width'}
            control={control}
            disabled={true}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
            label={'Height'}
            control={control}
            disabled={true}
            onClick={onClickEdit}
          />
        </CtrlCell>
      </CtrlRow>
    </DetailViewBase>
  );
}
