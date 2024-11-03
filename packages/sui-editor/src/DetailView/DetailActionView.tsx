/*
import * as React from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Button, CardActions,} from "@mui/material";
import { ITimelineAction, useTimeline } from "@stoked-ui/timeline";
import {SelectChangeEvent} from "@mui/material/Select";
import _ from "lodash";
import ControlledText from "./ControlledText";
import {CtrlCell, CtrlGroup, DetailTypeProps, DetailViewBase } from './Detail'
import {
  IDetailAction
} from "./DetailActionView.types";
import DesSelect from "./DesSelect";
import {humanFileSize} from "./DetailTrackView.types";

export default function DetailActionView(props: DetailTypeProps) {
  const { file, dispatch, engine } = useTimeline();
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
  } = useForm<IDetailAction>({
    mode: 'onChange',
    defaultValues: formData.action,
    resolver: yupResolver(schema.action),
  });

  // Form submit handler
  const onSubmit: SubmitHandler<IDetailAction> = (dataAction) => {

    const newDetail = {...detail};
    if (newDetail.action && dataAction) {
      newDetail.action.name = dataAction.name;
    }
    setDetail(newDetail);

    const trackIndex = file?.tracks?.findIndex((prevTrack) => prevTrack.id === dataAction.id);
    if (trackIndex && trackIndex !== -1 && dataAction && file?.tracks?.[trackIndex]) {
      file.tracks[trackIndex].name = dataAction!.name;
    }
    console.log('Form data:', dataAction, 'detail', detail);
  };

  // Reset the form on cancel
  const handleCancel = () => {
    if (detail) {
      reset(detail.action); // Reset to existing data from state
    }
  };

  const detailViewBase = {
    title: detail.action?.name ?? detail.track?.name ?? detail.video.name,
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
    onClose
  };
  return (
    <DetailViewBase {...detailViewBase} engine={engine}>
      <CtrlCell width="100%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Action Name'}
          name={'name'}
          control={control}
          disabled={!editMode}
          onClick={onClickEdit}
        />
      </CtrlCell>

      <CtrlGroup label={'Actions'}>
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
        </CtrlCell>
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
      </CtrlGroup>
      <CardActions sx={{ width: '100%', justifyContent: 'right'}}>
        <Button
          className=""
          variant="outlined"
          color="secondary"
          onClick={() => {
            if (isDirty) {
              reset(detail.action)
            }
            setEditMode(false);
          }}>
          Cancel
        </Button>
        <Button
          className=""
          variant="contained"
          color="secondary"
          type="submit"
          disabled={!isDirty || !_.isEmpty(errors)}
        >
          Save
        </Button>
      </CardActions>
    </DetailViewBase>
  );
}
*/
