import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { TrackDetail } from "@stoked-ui/timeline";
import ControlledText from "./ControlledText";
import {
  CtrlCell, CtrlRow, DetailActions, DetailForm, formatTitle, FormWrap, useEditMode,
} from './Detail'
import {
  DetailViewProps,
  IEditorTrackDetail, trackObjectSchema,
} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";
import ControlledSelect from "./ControlledSelect";
import ControlledCheckbox from "./ControlledCheckbox";
import BlendModeSelect from "./BlendModeSelect";

export function DetailTrack(props: DetailViewProps) {
  const {
    editMode,
    enableEdit,
    disableEdit
  } = props;

  const { state, dispatch } = useEditorContext();
  const { selectedDetail, selected} = state;
  const track = (selectedDetail as TrackDetail).track as IEditorTrackDetail;

  track.blendMode = track.blendMode ?? 'normal';
  track.hidden = !!track.hidden;
  track.locked = !!track.locked;
  track.muted = !!track.muted;

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isDirty
    }, reset,
    } = useForm<IEditorTrackDetail>({
    defaultValues: track,
    resolver: yupResolver(trackObjectSchema) as any,
  });

  const onSubmit: SubmitHandler<IEditorTrackDetail> = (data) => {
    console.log('data', data);
    dispatch({ type: 'UPDATE_TRACK', payload: data });
  };

  return (
    <FormWrap
      title={selected?.name}
      titleId={(props.detail as TrackDetail).track.id}
      submitHandler={handleSubmit(onSubmit)}
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
        <CtrlCell width="30%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            name={'name'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="10%">
          <BlendModeSelect
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="30%">
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Hidden'}
            name={'hidden'}
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
        <CtrlCell width="40%">
          <ControlledSelect
            control={control}
            label={'Fit'}
            name={'fit'}
            defaultValue={'cover'}
            disabled={!editMode}
            onClick={enableEdit}
            options={[
              'none',
              'contain',
              'cover',
              'fill'
            ].map((option) => { return { value: option, label: formatTitle(option) }})}
            rules={{ required: "This field is required" }}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Url'}
            control={control}
            disabled={!editMode}
            onClick={enableEdit}
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
    </FormWrap>
  )
}
