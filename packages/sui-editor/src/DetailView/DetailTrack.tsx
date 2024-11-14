import * as React from "react";
import { Control, SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ControlledTrack } from "@stoked-ui/timeline";
import ControlledText from "./ControlledText";
import {
  CtrlCell,
  CtrlRow,
  DetailActions,
  FormWrap,
  useEditMode,
} from './Detail'
import { DetailTrackProps } from "./DetailTrack.types";
import ControlledCheckbox from "./ControlledCheckbox";
import { IDetailTrack, trackSchema } from "./Detail.types";
import { useDetail } from "./DetailProvider";


export function DetailTrack(props: DetailTrackProps) {
  const { detail, selectedTrack, selected, dispatch } = useDetail();
  const editModeData = useEditMode();
  const { editMode, setEdit, setDisable } = editModeData;

  const {
    control,
    handleSubmit,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<IDetailTrack>({
    defaultValues: detail[detail.type],
    resolver: yupResolver(trackSchema),
  });

  const onSubmitTrack: SubmitHandler<IDetailTrack> = (submitData: IDetailTrack) => {
    setDisable();
    dispatch({ type: 'UPDATE_TRACK', payload: submitData });
  };

  if (!selectedTrack) {
    return undefined;
  }

  return (
    <FormWrap
      onSubmit={onSubmitTrack}
      handleSubmit={handleSubmit}
      title={selected.name}
    >
      <CtrlRow>
        <ControlledTrack width={800} />
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="45%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!editMode}
            onClick={setEdit}
          />
        </CtrlCell>
        <CtrlCell width="30%">
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Hidden'}
            control={control}
            disabled={!editMode}
            onClickLabel={setEdit}
            onClick={setEdit}
          />
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Locked'}
            name={'lock'}
            control={control}
            disabled={!editMode}
            onClickLabel={setEdit}
            onClick={setEdit}
          />
        </CtrlCell>
      </CtrlRow>
      <DetailActions errors={errors} isDirty={isDirty} reset={reset} editModeData={editModeData} />
    </FormWrap>
  )
}
