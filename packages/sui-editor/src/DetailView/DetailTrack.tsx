import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ControlledText from "./ControlledText";
import { CtrlCell, CtrlRow, DetailViewBase, FileDetailView, } from './Detail'
import { DetailTrackProps } from "./DetailTrack.types";
import ControlledCheckbox from "./ControlledCheckbox";
import { IDetailTrack, trackSchema } from "./Detail.types";
import { useEditorContext } from "../EditorProvider/EditorContext";

export function DetailTrack(props: DetailTrackProps) {
  const { file, detail, settings, engine, selectedTrack, selectedAction, dispatch } = useEditorContext();
  const {
    editor,
  } = props;

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
      dispatch({ type: 'UPDATE_TRACK', payload: submitData });
      editor.unset();
  };

  const detailViewBase = {
    ...props,
    title: detail.project?.name,
    formName: 'track-detail',
    editor,
    handleSubmit,
    errors,
    control,
    isDirty,
    reset,
  };

  if (!selectedTrack) {
    return undefined;
  }
  return (
    <DetailViewBase {...detailViewBase}
                    display={<FileDetailView file={selectedTrack.file} onClick={editor.setFunc(true)}/>}
      onSubmit={onSubmitTrack}
    >
      <CtrlRow>
        <CtrlCell width="45%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!editor.isTrue(settings)}
            onClick={editor.setFunc()}
          />
        </CtrlCell>
        <CtrlCell width="30%">
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Hidden'}
            control={control}
            disabled={!editor.isTrue(settings)}
            onClickLabel={editor.setFunc()}
            onClick={editor.setFunc()}
          />
          <ControlledCheckbox
            className={'whitespace-nowrap flex-grow flex'}
            label={'Locked'}
            name={'lock'}
            control={control}
            disabled={!editor.isTrue(settings)}
            onClickLabel={editor.setFunc()}
            onClick={editor.setFunc()}
          />
        </CtrlCell>
      </CtrlRow>

    </DetailViewBase>
  )
}
