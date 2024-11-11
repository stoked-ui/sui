import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { styled } from "@mui/material";
import Timeline, { TimelineState } from "@stoked-ui/timeline";
import ControlledText, { UncontrolledText } from "./ControlledText";
import { CtrlCell, CtrlColumn, CtrlRow, DetailViewBase } from './Detail'
import Controllers from "../Controllers/Controllers";
import { EditorControls } from "../EditorControls";
import ControlledColor from "./ControlledColor";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { DetailProjectProps } from './DetailProject.types';
import { IDetailProject, projectSchema } from "./Detail.types";

const DetailRenderer = styled('canvas', {
  name: "MuiEditorViewRenderer",
  slot: "renderer",
})(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  left: 0,
  overflow: 'hidden',
  aspectRatio: `${16 / 9}`,
  borderRadius: '12px 12px 0px 0px',
  background: theme.palette.background.default,
  width: '100%',
  height: '100%'
}));

export function DetailProject(props: DetailProjectProps) {
  const timelineState = React.useRef<TimelineState>(null);
  const { id, detail,settings,  file, engine, dispatch } = useEditorContext();
  const {
    editor
  } = props;

  const editable = () => editor.isTrue(settings);
  React.useEffect(() => {
    const detailCanvas = document.getElementById('detail-renderer');
    if (detailCanvas) {
      dispatch({ type: 'SET_RENDERER', payload: detailCanvas as HTMLCanvasElement });
    }
  }, []);

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
    editor.set(undefined);
  };

  const detailViewBase = {
    title: file?.name ?? '',
    formName: 'project-detail',
    editor,
    handleSubmit,
    onSubmit,
    errors,
    control,
    isDirty,
    reset,
  };

  return (
    <DetailViewBase<IDetailProject> {...detailViewBase}
      display={ <CtrlColumn id={'detail-renderer-container'} sx={{ padding: '0px' }}>
        <DetailRenderer id={'detail-renderer'} ata-preserve-aspect-ratio width={'1920'} sx={{ backgroundColor: `${detail.project.backgroundColor}!important` }}/>
        <EditorControls
          role={'controls'}
          timeline
          switchView={false}
        />
        <Timeline
          role={'timeline'}
          {...engine.control.timelineProps}
          controllers={Controllers}
          timelineState={timelineState}
          autoScroll
          labels
          locked
          collapsed
          disableDrag
          viewSelector={`.MuiEditorView-root`}
          sx={{ width: '100%' }}
        />
      </CtrlColumn>}
      onSubmit={onSubmit}
    >

      <CtrlRow>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Name'}
            control={control}
            disabled={!editor.isTrue(settings)}
            onClick={editor.setFunc(true)}
          />
        </CtrlCell>
        <CtrlCell width="15%">
          <UncontrolledText
            className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
            label={'Size'}
            value={`${detail.project.width} x ${detail.project.height}`}
            disabled
            onClick={editor.setFunc(true)}
          />
        </CtrlCell>

        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Description'}
            name={'description'}
            control={control}
            disabled={!editable()}
            onClick={editor.setFunc(true)}
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
            onClick={editor.setFunc(true)}
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
            onClick={editor.setFunc(true)}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledText
            className={'whitespace-nowrap flex-grow flex'}
            label={'Author'}
            name={'project.author'}
            control={control}
            disabled={!editable()}
            onClick={editor.setFunc(true)}
          />
        </CtrlCell>
        <CtrlCell width="40%">
          <ControlledColor
            className={'whitespace-nowrap flex-grow flex Mui-shrink-full'}
            label={'Background Color'}
            name={'backgroundColor'}
            type={'color'}
            control={control}
            disabled={!editor.isTrue(settings)}
            onClick={editor.setFunc(true)}
          />
        </CtrlCell>
      </CtrlRow>
    </DetailViewBase>
  );
}
