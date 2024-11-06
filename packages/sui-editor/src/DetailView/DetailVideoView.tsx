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
import { FormData } from '../DetailView/DetailView.types';

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
  const { file, engine, dispatch } = useEditorContext();
  const {
    setEditMode,
    editMode,
    formRef,
    onClickEdit,
    breadcrumbs,
    formInfo,
    schema,
    onClose
  } = props;
  const { data, detail } = formInfo;

  const useFormResult = useForm<ITimelineFileBase>({
    mode: 'onChange',
    defaultValues: data.video,
    resolver: yupResolver(schema.video),
  });

  console.info('formData.video', data.video)
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
  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    data.video.lastModified = Date.now();
    dispatch({ type: 'UPDATE_VIDEO', payload: data.video });
  };

  const detailViewBase = {
    title: file?.name ?? '',
    formName: 'video-detail',
    editMode,
    onClickEdit,
    handleSubmit,
    onSubmit,
    detail,
    errors,
    control,
    formInfo,
    isDirty,
    reset,
    setEditMode,
    engine,
    onClose
  };

  const checkedProps = checkProps({} as TimelineControlProps);

  console.log('isDirty', isDirty, data.video, );
  return (
    <DetailViewBase {...detailViewBase}>
      <CtrlColumn id={'detail-renderer-container'}>
        <DetailRenderer ata-preserve-aspect-ratio width={'1920'} sx={{ backgroundColor: `${data.video.backgroundColor}!important` }}/>
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
          disableDrag
          viewSelector={`.MuiEditorView-root`}
          sx={{ width: '100%' }}
        />
      </CtrlColumn>
      <CtrlRow>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            name={'video.name'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Description'}
            name={'video.description'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Author'}
            name={'video.author'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Created'}
            name={'video.created'}
            control={control}
            disabled
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
            name={'video.lastModified'}
            control={control}
            disabled
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
            name={'video.backgroundColor'}
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
            name={'video.width'}
            control={control}
            disabled
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
            label={'Height'}
            name={'video.height'}
            control={control}
            disabled
            onClick={onClickEdit}
          />
        </CtrlCell>
      </CtrlRow>
    </DetailViewBase>
  );
}
