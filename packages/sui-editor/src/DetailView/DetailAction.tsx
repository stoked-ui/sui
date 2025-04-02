import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActionDetail, ITimelineTrackDetail, TrackDetail
} from '@stoked-ui/timeline';
import ControlledText, {UncontrolledText} from "./ControlledText";
import {
  CtrlCell, CtrlRow, DetailActions, FormWrap, useEditMode
} from './Detail'
import {
  actionDataSchema,
  actionSchema,
  DetailViewProps,
  IEditorActionDetail,
  IEditorProjectDetail, IEditorTrackDetail
} from "./Detail.types";
import { useEditorContext } from "../EditorProvider/EditorContext";
import BlendModeSelect from "./BlendModeSelect";
import ControlledCoordinates from "./ControlledCoordinates";
import ControlledVolumeSpan from "./ControlledVolumeSpan";

export function DetailAction(props: DetailViewProps) {
  const { state: { file, selectedTrack, engine,  settings, selectedDetail, selectedAction}, dispatch } = useEditorContext();
  const { editMode, enableEdit, disableEdit } = props;
  const { trackFiles } = settings;
  const actionDetail = selectedDetail as ActionDetail;
  const actionData = actionDetail.action as IEditorActionDetail;
  const trackData = actionDetail.track as IEditorTrackDetail;
  const trackFile = trackFiles[trackData.id];

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<IEditorActionDetail>({
    mode: 'onChange',
    defaultValues: actionData,
    // @ts-ignore
    resolver: yupResolver(actionDataSchema),
  });

  console.info('actiondata', actionData);


  // Watch all form values
  const formValues = watch();

  // Effect to handle changes in form values
  React.useEffect(() => {
    if (engine.screener) {
      engine.screener.style.mixBlendMode = formValues.blendMode;
    }
  }, [formValues]);

  React.useEffect(() => {
    reset(actionData);
  }, [actionData, reset]);

  // Form submit handler
  const onSubmitAction: SubmitHandler<IEditorActionDetail> = (submitData: IEditorActionDetail) => {
    console.info('submitData', submitData);
    dispatch({ type: 'UPDATE_ACTION', payload: submitData });
    file?.save({ silent: true })
  };
  console.info('errors', errors);
  if (!selectedAction || !selectedTrack) {
    return undefined;
  }

  return (
    <FormWrap
      title={selectedAction?.name}
      titleId={actionData.id}
      submitHandler={handleSubmit(onSubmitAction)}
    >
      {/* Display All Errors */}
      {Object.keys(errors).length > 0 && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          <ul>
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error?.message}</li>
            ))}
          </ul>
        </div>
      )}
    <div>
      <CtrlRow>
        <CtrlCell width="40%">
          <ControlledText
            label={'Name'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="20%">
          <ControlledText
            label={'Start'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="20%">
          <ControlledText
            label={'End'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>

        <CtrlCell width="23%">
          <ControlledText
            label={'Trim Start'}
            name={'trimStart'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="23%">
          <ControlledText
            label={'Trim End'}
            name={'trimEnd'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>

        <CtrlCell width="23%">
          <ControlledCoordinates
            control={control}
            disabled={!editMode}
            onClick={props.enableEdit}/>
        </CtrlCell>

        <CtrlCell width="23%">
          <BlendModeSelect
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        {trackFile.mediaType !== 'audio' &&
         <React.Fragment>
           <CtrlCell width="23%">
            <ControlledText
              label={'Width'}
              name={'width'}
              control={control}
              disabled={!editMode}
              onClick={props.enableEdit}
            />
          </CtrlCell>
          <CtrlCell width="23%">
            <ControlledText
              label={'Height'}
              control={control}
              disabled={!editMode}
              onClick={props.enableEdit}
            />
          </CtrlCell>
          <CtrlCell width="46%">
            <UncontrolledText
              label={'Source Size'}
              value={`${trackFile?.media?.width} x ${trackFile?.media?.height}`}
              disabled
              onClick={props.enableEdit}
            />
          </CtrlCell>
         </React.Fragment>}
        <CtrlCell width="96%">
          <ControlledVolumeSpan
            control={control}
            name={'volume'}
            disabled={!editMode}
            onClick={props.enableEdit}
            sliderSx={{ width: '50%' }}
            sx={{ width: '100%' }}
            getValues={getValues}
            setValue={setValue}
            start={getValues('start')}
            end={getValues('end')}
          />
        </CtrlCell>
      </CtrlRow>
      <DetailActions
        errors={errors}
        isDirty={isDirty}
        reset={reset}
        disableEdit={disableEdit}
        editMode={editMode}
      />
    </div>
    </FormWrap>)
}

