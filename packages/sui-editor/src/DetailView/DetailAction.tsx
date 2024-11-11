import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ControlledTrack, } from '@stoked-ui/timeline';
import ControlledText from "./ControlledText";
import { CtrlCell, DetailViewBase, FileDetailView } from './Detail'
import { DetailActionProps } from "./DetailAction.types";
import { actionSchema, IDetailAction } from "./Detail.types";
import { useEditorContext } from "../EditorProvider/EditorContext";

export function DetailAction(props: DetailActionProps) {
  const { file, settings, engine, selectedTrack, selectedAction, dispatch } = useEditorContext();
  const {
    editor,
    data,
  } = props;
  const onClickEdit = editor.unsetFunc();
  const editMode = () => editor.isTrue(settings);
  const setEditMode = editor.setFunc(true);


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
    setEditMode();
  };

  const detailViewBase = {
    ...props,
    title: data.project?.name,
    formName: 'action-detail',
    onClickEdit,
    handleSubmit,
    errors,
    control,
    isDirty,
    reset,
    engine,
  };

  if (!selectedAction) {
    return undefined;
  }


  return (
    <DetailViewBase
      {...detailViewBase}
      display={<ControlledTrack width={800} />}
      onSubmit={onSubmitAction}
    >
      <FileDetailView file={selectedTrack?.file} onClick={onClickEdit}/>
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
    </DetailViewBase>
  )
}
