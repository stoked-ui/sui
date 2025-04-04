/**
 * The DetailAction component, responsible for handling the details of an action in the timeline.
 *
 * @param props - The component props containing the necessary data to display and update the action details.
 */

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
  /**
   * The context object containing the state and dispatch function for editing actions.
   */
  const { state: { file, selectedTrack, engine, settings, selectedDetail, selectedAction}, dispatch } = useEditorContext();

  /**
   * The edit mode props controlling the display and editability of form fields.
   */
  const { editMode, enableEdit, disableEdit } = props;

  /**
   * The track files object containing data for each track file in the timeline.
   */
  const { trackFiles } = settings;

  /**
   * The action detail object containing data about the selected action in the timeline.
   */
  const actionDetail = selectedDetail as ActionDetail;

  /**
   * The action data object containing data about the selected action.
   */
  const actionData = actionDetail.action as IEditorActionDetail;

  /**
   * The track data object containing data about the selected track.
   */
  const trackData = actionDetail.track as IEditorTrackDetail;

  /**
   * The track file object containing data for the selected track file.
   */
  const trackFile = trackFiles[trackData.id];

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue
  } = useForm(actionSchema);

  /**
   * Handles form submission and updates the action data accordingly.
   */
  const onSubmit: SubmitHandler = (data) => {
    // Update action data with new values from the form
    actionData.trimStart = data.trimStart;
    actionData.trimEnd = data.trimEnd;
    actionData.width = data.width;
    actionData.height = data.height;
    actionData.volume = data.volume;

    // Save updated action data to the timeline context
    dispatch({ type: 'UPDATE_ACTION', payload: actionData });
  };

  return (
    /**
     * The form containing all the fields for editing an action in the timeline.
     */
    <FormWrap onSubmit={handleSubmit(onSubmit)}>
      {trackFile.mediaType !== 'audio' &&
       [
         <React.Fragment key="audio-fields">
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
         </React.Fragment>,
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
       ]}
      <CtrlRow>
        {trackFile.mediaType !== 'audio' &&
         [
           <React.Fragment key="trim-fields">
             <CtrlCell width="23%">
               <ControlledText
                 label={'Trim Start'}
                 name={'trimStart'}
                 control={control}
                 disabled={!editMode}
                 onClick={props.enableEdit}
               />
             </CtrlCell>
             <CtrlCell width="23%">
               <ControlledText
                 label={'Trim End'}
                 name={'trimEnd'}
                 control={control}
                 disabled={!editMode}
                 onClick={props.enableEdit}
               />
             </CtrlCell>
           </React.Fragment>,
           <CtrlCell width="23%">
             <ControlledCoordinates
               control={control}
               disabled={!editMode}
               onClick={props.enableEdit}/>
           </CtrlCell>
         ]}
      </CtrlRow>
      <DetailActions
        errors={errors}
        isDirty={isDirty}
        reset={reset}
        disableEdit={disableEdit}
        editMode={editMode}
      />
    </FormWrap>
  );
}