import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { styled } from "@mui/material";
import Timeline, { TimelineState } from "@stoked-ui/timeline";
import ControlledText, { UncontrolledText } from "./ControlledText";
import {
  CtrlCell,
  CtrlRow,
  DetailActions,
  FormWrap,
  useEditMode
} from './Detail'
import ControlledColor from "./ControlledColor";
import { DetailProjectProps } from './DetailProject.types';
import { IDetailProject, projectSchema } from "./Detail.types";
import { useDetail } from "./DetailProvider";


export function DetailProject(props: DetailProjectProps) {
  const { detail,file, selected , engine, dispatch } = useDetail();
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
  } = useForm<IDetailProject>({
    defaultValues: detail.project,
    resolver: yupResolver(projectSchema),
  });

  // Form submit handler
  const onSubmit: SubmitHandler<IDetailProject> = (submitData: IDetailProject) => {
    submitData.lastModified = Date.now();
    dispatch({ type: 'UPDATE_PROJECT', payload: submitData });
  };

  return (
    <FormWrap
      onSubmit={onSubmit}
      handleSubmit={handleSubmit}
      title={selected.name}
    >
      <CtrlRow>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!editMode}
            onClick={setEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <UncontrolledText
            className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
            label={'Size'}
            value={`${detail.project.width} x ${detail.project.height}`}
            disabled
            onClick={setEdit}
          />
        </CtrlCell>

        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Description'}
            name={'description'}
            control={control}
            disabled={!editMode}
            onClick={setEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <UncontrolledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Created'}
            name={'created'}
            disabled
            format={(epoch: number) => {
              if (epoch) {
                return new Date(epoch).toDateString();
              }
              return epoch;
            }}
            onClick={setEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <UncontrolledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Last Modified'}
            name={'lastModified'}
            disabled
            format={(epoch: number) => {
              if (epoch) {
                return new Date(epoch).toDateString();
              }
              return '';
            }}
            onClick={setEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Author'}
            name={'project.author'}
            control={control}
            disabled={!editMode}
            onClick={setEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledColor
            className={'whitespace-nowrap flex-grow flex Mui-shrink-full'}
            label={'Background Color'}
            name={'backgroundColor'}
            type={'color'}
            control={control}
            disabled={!editMode}
            onClick={setEdit}
          />
        </CtrlCell>
      </CtrlRow>
      <DetailActions errors={errors} isDirty={isDirty} reset={reset} editModeData={editModeData} />
    </FormWrap>
  )
}
