import * as React from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useTimeline } from "@stoked-ui/timeline";
import ControlledText from "./ControlledText";
import {
  CtrlCell, CtrlGroup, CtrlRow, DetailTypeProps, DetailViewBase,
} from './Detail'
import {
  humanFileSize,
  IDetailTrack,

} from "./DetailTrackView.types";
import ControlledCheckbox from "./ControlledCheckbox";

export default function DetailTrackView(props: DetailTypeProps) {
  const { file, engine, dispatch } = useTimeline();
  const {
    detail,
    setDetail,
    setEditMode,
    editMode,
    onClickEdit,
    formRef,
    breadcrumbs,
    formData,
    setFormData,
    schema,
    onClose
  } = props;

  const {
    control,
    handleSubmit,
    getValues,
    register,
    unregister,
    formState: {
      isDirty,
      errors,
      dirtyFields,
      isValid,
      isValidating,
      isSubmitting,
      submitCount
    },
    reset,
    trigger,
    setValue,
  } = useForm<IDetailTrack>({
    mode: 'onChange',
    defaultValues: formData.track,
    resolver: yupResolver(schema.track),
  });

  // Form submit handler
  const onSubmit: SubmitHandler<IDetailTrack> = (dataTrack) => {

    const newDetail = {...detail};
    if (newDetail.track && dataTrack) {
      newDetail.track.name = dataTrack.name;
    }
    setDetail(newDetail);

    const trackIndex = file?.tracks?.findIndex((prevTrack) => prevTrack.id === dataTrack.id);
    if (trackIndex !== undefined && trackIndex !== -1 && dataTrack && file?.tracks?.[trackIndex]) {
      file.tracks[trackIndex].name = dataTrack!.name;
      dispatch({ type: 'SET_TRACKS', payload: file.tracks});
    }
  };

  const detailViewBase = {
    title: detail.action?.name ?? detail.track?.name ?? detail.video?.name,
    formName: 'track-detail',
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
  return (
    <DetailViewBase {...detailViewBase}>
      <CtrlGroup label={'Track File'}>
        <CtrlCell width="70%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'File Name'}
            value={detail.selectedFile?.name}
            disabled
            onClick={onClickEdit}
          />
        </CtrlCell>

        <CtrlCell width="25%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'File Size'}
            value={detail.selectedFile?.size}
            disabled
            format={humanFileSize}
          />
        </CtrlCell>
      </CtrlGroup>
      <CtrlRow>
        <CtrlCell width="65%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Track Name'}
            name={'name'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="30%">
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Hidden'}
            control={control}
            disabled={!editMode}
            onClickLabel={onClickEdit}
            onClick={onClickEdit}
          />
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Locked'}
            name={'lock'}
            control={control}
            disabled={!editMode}
            onClickLabel={onClickEdit}
            onClick={onClickEdit}
          />

        </CtrlCell>
      </CtrlRow>

      {/* <CtrlGroup label={'Actions'}>
        <CtrlCell width="100%">
          <DesSelect
            control={control}
            label={'Selected Action'}
            name={'actions'}
            disabled={!editMode}
            key={'id'}
            value={'id'}
            width={400}
            format={(action: ITimelineAction) => `${action.start} - ${action.end}`}
            options={detail.track?.actions.map((action) => {
              return {
                value: action.id,
                label: `start: ${action.start}s; end: ${action.end}s`
              }
            })}
            onClick={onClickEdit}
            onChange={(event: SelectChangeEvent, fieldOnChange: (event: SelectChangeEvent, child?: any) => void, child?: any) => {
              fieldOnChange(event, child);
              console.info('event', event, 'child', child)
              const newAction = detail.track?.actions.find((action) => action.id === child.props.value)
              if (!detail.action || (newAction && detail.action.id !== newAction.id)) {
                setDetail({...detail, action: newAction})
              }
            }}
          />
        </CtrlCell> */}
      {detail.action &&
        <React.Fragment>
          <CtrlCell width="40%">
            <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Start'}
            name={'selectedAction.start'}
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'end'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'x'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'y'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Width'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'whitespace-nowrap flex-grow flex'}
              label={'Height'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'Start Trim'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'End Trim'}
              control={control}
              disabled={!editMode}
              onClick={onClickEdit}
            />
          </CtrlCell>
          <CtrlCell width="40%">
            <ControlledText
              className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
              label={'Duration'}
              control={control}
              onClick={onClickEdit}
            />
          </CtrlCell>
        </React.Fragment>
      }
    </DetailViewBase>
  );
}
