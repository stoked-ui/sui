import * as React from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import { ITimelineAction, ITimelineTrack, useTimeline } from "@stoked-ui/timeline";
import { SelectChangeEvent } from "@mui/material/Select";
import ControlledText from "./ControlledText";
import { CtrlCell, CtrlGroup, CtrlRow, DetailTypeProps, DetailViewBase, } from './Detail'
import { humanFileSize } from "./DetailTrackView.types";
import ControlledCheckbox from "./ControlledCheckbox";
import DesSelect from "./DesSelect";
import { IEditorAction } from "../EditorAction/EditorAction";
import { FormData, IDetailTrack } from "./DetailView.types";
import { useEditorContext } from "../EditorProvider";

export default function DetailTrackView(props: DetailTypeProps) {
  const { file, engine, dispatch } = useEditorContext();
  const {
    setEditMode,
    editMode,
    onClickEdit,
    formRef,
    breadcrumbs,
    formInfo,
    setFormInfo,
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
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: formInfo.data,
    resolver: yupResolver(schema),
  });

  // Form submit handler
  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    if (data.action) {
      data.video.lastModified = Date.now();
      dispatch({ type: 'UPDATE_ACTION', payload: data.action });
    }
  };
  const { detail } = formInfo;
  const detailViewBase = {
    title: detail.action?.name ?? detail.track?.name ?? detail.video?.name,
    formName: 'track-detail',
    editMode,
    onClickEdit,
    handleSubmit,
    onSubmit,
    errors,
    control,
    formInfo,
    setFormInfo,
    isDirty,
    reset,
    setEditMode,
    engine,
    onClose
  };
  return (
    <DetailViewBase {...detailViewBase}>
      <CtrlGroup label={'File Name'}>
        <CtrlCell width="70%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'File Name'}
            value={formInfo.data.file?.name}
            disabled
            onClick={onClickEdit}
          />
        </CtrlCell>

        <CtrlCell width="25%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Size'}
            value={formInfo.data.file?.size}
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
            control={control}
            disabled={!editMode}
            onClick={onClickEdit}
          />
        </CtrlCell>
        <CtrlCell width="30%">
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Hidden'}
            name={'track.hidden'}
            control={control}
            disabled={!editMode}
            onClickLabel={onClickEdit}
            onClick={onClickEdit}
          />
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Locked'}
            name={'track.lock'}
            control={control}
            disabled={!editMode}
            onClickLabel={onClickEdit}
            onClick={onClickEdit}
          />

        </CtrlCell>
      </CtrlRow>
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
            format={(action: IEditorAction) => `${action.start} - ${action.end}`}
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
              if (detail.track && (!detail.action  || (newAction && detail.action.id !== newAction.id))) {
                const payload = { action: newAction || null, track: detail.track };
                dispatch({ type: 'SELECT_ACTION', payload });
              }
            }}
          />
        </CtrlCell>
      </CtrlGroup>
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
