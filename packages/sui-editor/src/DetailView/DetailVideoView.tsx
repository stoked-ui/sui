import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import { styled } from "@mui/material";
import Timeline, { TimelineControlProps, useTimeline, ITimelineFile, TimelineState, checkProps } from "@stoked-ui/timeline";
import ControlledText from "./ControlledText";
import {
  CtrlCell,
  CtrlColumn,
  CtrlRow, DetailSelection,
  DetailTypeProps,
  DetailViewBase
} from './Detail'
import Controllers from "../Controllers/Controllers";
import {EditorLabels} from "../EditorLabels";
import {EditorControls} from "../EditorControls";
import ControlledColor from "./ControlledColor";

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


export interface ITimelineFile2 {
  id: string;
  name: string;
  description?: string;
  author?: string
  created: number;
  lastModified?: number;
  backgroundColor?: string;
  width: number;
  height: number;
  src?: string;
}


export default function DetailVideoView(props: DetailTypeProps) {
  const timelineState = React.useRef<TimelineState>(null);
  const { engine, file } = useTimeline();
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

  const detailCanvas = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    if (detailCanvas.current) {
      engine.rendererDetail = detailCanvas.current
    }
  },[detailCanvas.current])

  const useFormResult = useForm<ITimelineFile2>({
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
    title: detail.action?.name ?? detail.track?.name ?? detail.video.name,
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

  React.useEffect(() => {
   console.info('SET DETAIL CANVAS')
    if (timelineState.current?.engine && detailCanvas.current) {
      timelineState.current.engine.rendererDetail = detailCanvas.current;
      console.info('SET DETAIL CANVAS 1')
    }

    return () => {
      console.info('UNSET DETAIL CANVAS')

    }
  }, [])

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
          slots={{labels: EditorLabels}}
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
