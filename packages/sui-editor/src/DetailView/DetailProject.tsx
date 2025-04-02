import * as React from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ControlledText, { UncontrolledText } from "./ControlledText";
import {
  CtrlCell, CtrlRow, DetailActions, FormWrap,
} from './Detail'
import ControlledColor from "./ControlledColor";
import {DetailViewProps, IEditorProjectDetail, projectSchema} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";


export function DetailProject(props: DetailViewProps) {
  const { state: {file, selected , engine}, dispatch } = useEditorContext();

  const {
    control,
    handleSubmit,
    formState: {
      isDirty,
      errors,
    },
    reset,
  } = useForm<IEditorProjectDetail>({
    defaultValues: props.detail.project as IEditorProjectDetail,
    resolver: yupResolver(projectSchema),
  });

  const detailSubmit: SubmitHandler<IEditorProjectDetail> = (submitData: IEditorProjectDetail) => {
    props.disableEdit();
    dispatch({ type: 'UPDATE_PROJECT', payload: submitData });
    file?.save({ silent: true })
  };

  return (<FormWrap
    title={selected?.name}
    titleId={props.detail.project.id}
    submitHandler={handleSubmit(detailSubmit)}
  >
    <div>

      <CtrlRow>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!props.editMode}
            onClick={props.enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Created'}
            name={'created'}
            control={control}
            disabled
            format={(epoch: number) => {
              if (epoch) {
                return new Date(epoch).toDateString();
              }
              return epoch;
            }}
            onClick={props.enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Last Modified'}
            name={'lastModified'}
            disabled
            control={control}
            format={(epoch: number) => {
              if (epoch) {
                return new Date(epoch).toDateString();
              }
              return '';
            }}
            onClick={props.enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Description'}
            name={'description'}
            control={control}
            disabled={!props.editMode}
            onClick={props.enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <UncontrolledText
            className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
            label={'Size'}
            value={`${file!.width} x ${file!.height}`}
            disabled
            onClick={props.enableEdit}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <ControlledColor
            className={'whitespace-nowrap flex-grow flex Mui-shrink-full'}
            label={'Background Color'}
            name={'backgroundColor'}
            type={'color'}
            control={control}
            disabled={!props.editMode}
            onClick={props.enableEdit}
            darkLabel={'rgb(0 2 3)'}
            lightLabel={'#ececec'}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Author'}
            name={'author'}
            control={control}
            disabled={!props.editMode}
            onClick={props.enableEdit}
          />
        </CtrlCell>
      </CtrlRow>
      <DetailActions
        errors={errors}
        isDirty={isDirty}
        reset={reset}
        editMode={props.editMode}
        disableEdit={props.disableEdit}
      />
    </div>
  </FormWrap>
  )
}

