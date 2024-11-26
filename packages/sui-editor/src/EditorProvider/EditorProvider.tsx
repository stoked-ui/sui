import * as React from 'react';
import PropTypes from 'prop-types';
import { TimelineProvider, getDbProps } from '@stoked-ui/timeline';
import Controllers from '../Controllers/Controllers';
import EditorEngine from '../EditorEngine/EditorEngine';
import { EditorEngineState, IEditorEngine } from '../EditorEngine/EditorEngine.types';
import { EditorEvents } from '../EditorEngine';
import { EditorProviderProps, EditorReducer, EditorStateAction } from './EditorProvider.types';
import { IEditorFile, SUIEditor } from '../EditorFile/EditorFile';
import EditorState, {createEditorState, IEditorStateProps} from './EditorState';
import {IEditorAction} from "../EditorAction";
import {IEditorTrack} from "../EditorTrack";

function EditorProvider<
  EngineType extends IEditorEngine = IEditorEngine,
  EngineStateType extends EditorEngineState = EditorEngineState,
  State extends EditorState = EditorState,
  StateActionType extends EditorStateAction = EditorStateAction,
  FileType extends IEditorFile = IEditorFile,
  ActionType extends IEditorAction = IEditorAction,
  TrackType extends IEditorTrack = IEditorTrack,
>(props: EditorProviderProps<EngineType, State, StateActionType, FileType>) {
  const engine =
    props?.engine ??
    (new EditorEngine({
      events: new EditorEvents(),
      controllers: props.controllers,
    }) as IEditorEngine);
  const getState = () => {
    return engine.state as EditorEngineState;
  };
  const setState = (newState: EditorEngineState | string) => {
    engine.state = newState;
  };
  if (props.editorId === 'detail') {
  }
  const editorStateProps: IEditorStateProps<EngineType, EngineStateType, FileType> = {
    editorId: props.editorId,
    timelineId: props.timelineId,
    ...props,
    getState,
    engine: engine as EngineType,
    selectedTrack: props.selectedTrack ?? null,
    selectedAction: props.selectedAction ?? null,
  };
  const editorState = createEditorState<EngineType, EngineStateType, FileType, ActionType, TrackType>(editorStateProps);

  editorState.createFlags([{
    flag: 'noLabels',
    config: { defaultValue: false}
  }, {
    flag: 'fileView',
    config: { defaultValue: true },
  }, {
    flag: 'noTrackControls',
    config: { defaultValue: false },
  }, {
    flag: 'noSnapControls',
    config: { defaultValue: false },
  }, {
    flag: 'localDb',
    config: { defaultValue: true },
  }, {
    flag: 'noSaveControls',
    config: { defaultValue: false }
  }, {
    flag: 'record',
    config: { defaultValue: true }
  }, {
    flag: 'noResizer',
    config: { defaultValue: false }
  }, {
    flag: 'collapsed',
    config: { defaultValue: false }
  }, {
    flag: 'allControls',
    config: { defaultValue: false
    }
  }, {
    flag: 'detailMode',
    config: { defaultValue: false,
      addTriggers: ['minimal', 'noSaveControls'],
      removeTriggers: ['record']
    }
  }, {
    flag: 'minimal',
    config: {
      defaultValue: false,
      addTriggers: ['noLabels', 'noResizer', 'noTrackControls', 'noSnapControls', 'noViewControls']
    }
  },])
  const reducer = EditorReducer as (state: State, stateAction: StateActionType) => State;
  return (
    <TimelineProvider<EngineType, EngineStateType, State, StateActionType, FileType>
      {...props}
      {...editorState}
      file={editorState.file as FileType}
      engine={editorState.engine as EngineType}
      controllers={props.controllers ?? Controllers}
      reducer={reducer}
      localDb={getDbProps(SUIEditor, props.localDb)}
    >
      {props.children}
    </TimelineProvider>
  );
}

EditorProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.any,
  controllers: PropTypes.object,
  editorId: PropTypes.string,
  engine: PropTypes.object,
  file: PropTypes.any,
  localDb: PropTypes.oneOfType([
    PropTypes.oneOf([false]),
    PropTypes.shape({
      dbName: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
      initializeStores: PropTypes.arrayOf(PropTypes.string).isRequired,
      stores: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ]),
  reducer: PropTypes.func,
  timelineId: PropTypes.string,
} as any;

export default EditorProvider;
