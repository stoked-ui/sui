import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ControlledTrack, } from '@stoked-ui/timeline';
import ControlledText from "./ControlledText";
import {
  CtrlCell,
  DetailActions,
  FormWrap,
  useEditMode
} from './Detail'
import { DetailActionProps } from "./DetailAction.types";
import { actionSchema, DetailDataAction, IDetailAction } from "./Detail.types";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { useDetail } from "./DetailProvider";

export function DetailAction(props: DetailActionProps) {
  const { detail, selected, selectedTrack, selectedAction, dispatch } = useDetail();
  const editModeData = useEditMode();
  const { editMode, setEdit, setDisable } = editModeData;

  const data = detail as DetailDataAction;
  const {
    control,
    handleSubmit,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<IDetailAction>({
    mode: 'onChange',
    defaultValues: data.action,
    // @ts-ignore
    resolver: yupResolver(actionSchema),
  });

  // Form submit handler
  const onSubmitAction: SubmitHandler<IDetailAction> = (submitData: IDetailAction) => {
    dispatch({ type: 'UPDATE_ACTION', payload: submitData });
  };

  if (!selectedAction || !selectedTrack) {
    return undefined;
  }

  return (
    <FormWrap
      onSubmit={onSubmitAction}
      handleSubmit={handleSubmit}
      title={selected.name}
    >
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Start'}
          name={'selectedAction.start'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'end'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'x'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'y'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Width'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'whitespace-nowrap flex-grow flex'}
          label={'Height'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
          label={'Start Trim'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
          label={'End Trim'}
          control={control}
          disabled={!editMode}
          onClick={setEdit}
        />
      </CtrlCell>
      <CtrlCell width="40%">
        <ControlledText
          className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
          label={'Duration'}
          control={control}
          onClick={setEdit}
        />
      </CtrlCell>
      <DetailActions errors={errors} isDirty={isDirty} reset={reset} editModeData={editModeData} />
    </FormWrap>)
}
