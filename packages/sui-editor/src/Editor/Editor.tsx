import * as React from 'react';
import PropTypes from 'prop-types';
import Timeline, {
  ITimelineTrack,
  ITimelineAction,
  IController,
  EngineState,
  createAction
} from '@stoked-ui/timeline';
import {namedId} from '@stoked-ui/common';
import {FileExplorer} from '@stoked-ui/file-explorer';
import {IMediaFile, MediaFile} from '@stoked-ui/media-selector';
import {SlotComponentProps, useSlotProps} from '@mui/base/utils';
import {SxProps} from "@mui/material";
import composeClasses from '@mui/utils/composeClasses';
import useForkRef from "@mui/utils/useForkRef";
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {useEditor} from '../internals/useEditor';
import EditorTrackActions from '../EditorTrack/EditorTrackActions';
import {EditorProps} from './Editor.types';
import {EditorPluginSignatures, VIDEO_EDITOR_PLUGINS} from './Editor.plugins';
import {EditorControls} from '../EditorControls/EditorControls';
import EditorView from '../EditorView';
import {getEditorUtilityClass} from './editorClasses';
import Controllers from "../Controllers";
import DetailModal from "../DetailView/DetailView";
import {useEditorContext} from "../EditorProvider/EditorContext";
import {IEditorAction, IEditorFileAction} from "../EditorAction/EditorAction";
import {IEditorTrack} from "../EditorTrack/EditorTrack";
import EditorFile, {IEditorFile} from "../EditorFile/EditorFile";
import ZoomCtrl from './Zoom';

const useThemeProps = createUseThemeProps('MuiEditor');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(ownerState: EditorProps<R, Multiple>,) => {
  const {classes} = ownerState;

  const slots = {
    root: ['root'],
    editorView: ['editorView'],
    controls: ['controls'],
    timeline: ['timeline'],
    fileExplorer: ['fileExplorer'],
  };

  return composeClasses(slots, getEditorUtilityClass, classes);
};

const EditorRoot = styled('div', {
  name: 'MuiEditor',
  slot: 'root',
  shouldForwardProp: (prop) => prop !== 'allControls'
                               && prop !== 'ownerState'
                               && prop !== 'fileUrl'
                               && prop !== 'noSaveControls'
                               && prop !== 'record'
                               && prop !== 'noSnapControls'
                               && prop !== 'noTrackControls'
                               && prop !== 'noTrackControls'
                               && prop !== 'file'
                               && prop !== 'fileView'
                               && prop !== 'viewButtons'
                               && prop !== 'viewButtonEnter'
                               && prop !== 'viewButtonExit'
                               && prop !== 'viewButtonAppear'
                               && prop !== 'detailMode'
                               && prop !== 'fullscreen',

})<{ fullscreen: boolean, fileView: boolean }>(({theme, fullscreen, fileView}) => {
  const width = fullscreen ? '100vw' : '100%';
  const height = fullscreen ? '100vh' : '100%';
  return {
    display: "grid", flexDirection: 'column', width, height, "@media (max-height: 700px)": {
      gridTemplateAreas: `
        "viewer"
        "controls"
        "timeline"`,
      gridTemplateRows: "min-content min-content max-content",
      '& [role="file-explorer"]': {
        display: 'none'
      }
    }, "@media (min-height: 701px)": {
      gridTemplateAreas: `
        "viewer"
        "controls"
        "timeline"
        ${fileView ? "files" : ''}`,
      gridTemplateRows: `min-content min-content ${fileView ? 'auto auto' : 'auto'}`,
      '& ul[role=file-explorer]': {
        display: `${fileView ? 'block' : 'none'}`, position: `${fileView ? undefined : 'absolute'}`,
      }
    }, '& .MuiEditorView-root': {
      overflow: 'hidden',
    }, overflow: 'hidden',
  }
});

function createDirectoryFile({dirname, children}: { dirname: string, children: IMediaFile[] }) {
  const versionDir = {
    id: dirname.toLocaleLowerCase(),
    name: dirname,
    expanded: true,
    selected: true,
    mediaType: 'folder',
    icon: null,
    thumbnail: null,
    blob: null,
  };
  const blob = new Blob([JSON.stringify(versionDir)], {type: "inode/directory"});
  const url = URL.createObjectURL(blob);
  return new MediaFile([blob], versionDir.name, {type: 'inode/directory', children});
}

interface TimelineSlotProps {
  trackControls?: any
}

/**
 *
 * Demos:
 *
 * - [Editor](https://stoked-ui.github.io/editor/docs/)
 *
 * API:
 *
 * - [Editor API](https://stoked-ui.github.io/editor/api/)
 */
const Editor = React.forwardRef(function Editor<R extends IMediaFile = IMediaFile, Multiple extends boolean | undefined = undefined, >(inPropsId: EditorProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const {state: context, dispatch} = useEditorContext();
  const {
    file, flags, engine, getState, components, settings
  } = context;
  const {fitScaleData, editorId } = settings;

  const {id: editorIdLocal, ...inProps} = inPropsId;

  const defaultSx = inProps.fullscreen || flags?.fullscreen ? {} : {borderRadius: '6px 6px 0 0'}
  const {sx = defaultSx, ...props} = useThemeProps({props: inProps, name: 'MuiEditor'});
  const {
    noLabels,
    fileView,
    noTrackControls,
    noSnapControls,
    localDb,
    openSaveControls,
    record,
    noResizer,
    allControls,
    fullscreen,
    detailMode,
    minimal,
    ...noFlagProps
  } = inProps;
  React.useEffect(() => {
    const set = ['noLabels', 'fileView', 'noTrackControls', 'noSnapControls', 'localDb', 'openSaveControls', 'record', 'noResizer', 'allControls', 'fullscreen', 'detailMode', 'minimal'];
    const flagProps = {
      noLabels,
      fileView,
      noTrackControls,
      noSnapControls,
      localDb,
      openSaveControls,
      record,
      noResizer,
      allControls,
      fullscreen,
      detailMode,
      minimal
    }
    const values = Object.keys(flagProps).filter((key) => flagProps[key] === true);
    dispatch({type: 'SET_FLAGS', payload: {add: values, remove: []}});
  }, []);

  const {
    rootRef,
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getFileExplorerProps,
    instance
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS, rootRef: ref, props,
  });

  const {slots, slotProps} = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    getSlotProps: getRootProps,
    ownerState: props,
  });

  const EditorViewSlot = slots?.editorView ?? EditorView;
  const editorViewProps = useSlotProps({
    elementType: EditorViewSlot,
    externalSlotProps: slotProps?.editorView,
    className: classes.editorView,
    getSlotProps: getEditorViewProps,
    ownerState: {...props},
  });

  const ControlsSlot = slots?.controls ?? EditorControls;
  const videoControlsProps = useSlotProps({
    elementType: ControlsSlot,
    externalSlotProps: slotProps?.controls,
    className: classes.controls,
    getSlotProps: getControlsProps,
    ownerState: {...props},
  });

  const TimelineSlot = slots?.timeline ?? Timeline;
  const timelineProps = useSlotProps({
    elementType: TimelineSlot,
    externalSlotProps: slotProps?.timeline,
    className: classes.timeline,
    getSlotProps: getTimelineProps,
    ownerState: {...noFlagProps, trackControls: EditorTrackActions} as any,
  });

  const Explorer = slots?.fileExplorer ?? FileExplorer;
  const fileExplorerProps = useSlotProps({
    elementType: Explorer,
    externalSlotProps: slotProps?.fileExplorer,
    className: classes.fileExplorer,
    getSlotProps: getFileExplorerProps,
    ownerState: inProps.FileExplorerProps as any,
  });

  const viewerRef = React.useRef<HTMLDivElement>(null);
  const [startIt, setStartIt] = React.useState(false);
  React.useEffect(() => {
    if (!startIt && engine && engine.isLoading && viewerRef.current) {
      setStartIt(true);
      engine.viewer = viewerRef.current;

      dispatch({
        type: 'VIEWER', payload: viewerRef.current
      });
    }
  }, [viewerRef.current, engine, engine?.isLoading]);

  const [mediaFiles, setMediaFiles] = React.useState<IMediaFile[]>([]);
  const [files, setFiles] = React.useState<IMediaFile[]>([]);
  const [saved, setSaved] = React.useState<IMediaFile[]>([])
  const [view, setView] = React.useState<'timeline' | 'files'>('timeline')
  const [currentVersion, setCurrentVersion] = React.useState<string>()

  React.useEffect(() => {
    const actionFilesFolder = createDirectoryFile({dirname: 'Tracks', children: mediaFiles})
    const versionDir = createDirectoryFile({dirname: 'Versions', children: saved})
    setFiles([actionFilesFolder, versionDir]);

  }, [mediaFiles, saved])

  React.useEffect(() => {
    if (settings && !settings.editorMode) {
      dispatch({ type: 'SET_SETTING', payload: {key: 'editorMode', value: noFlagProps.mode ?? 'project'}});
    }
  }, [noFlagProps.mode])

  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    context: ITimelineTrack | ITimelineAction;
    type: 'action' | 'track' | 'label'
  } | null>(null);

  const handleContextMenuAction = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: {
    action: ITimelineAction; track: ITimelineTrack; time: number;
  }) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.action, type: 'action'
    });
  };

  const handleContextMenuTrack = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: {
    track: ITimelineTrack; time: number;
  }) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.track, type: 'track'
    });
  };

  const handleContextMenuLabel = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: {
    track: ITimelineTrack; time: number;
  }) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.track, type: 'label'
    });
  };

  const onAddFiles = async () => {
    const newMediaFiles = await MediaFile.openDialog()
    let addFile = file;

    if (!newMediaFiles.length) {
      return;
    }

    const newTracks: IEditorTrack[] = [];
    for (let i = 0; i < newMediaFiles.length; i += 1) {
      const mediaFile = newMediaFiles[i];
      const action = createAction<IEditorAction>({
        id: namedId('action'),
        name: mediaFile.name,
        start: engine.time || 0,
        end: (mediaFile.media?.duration || engine.time || 0) + 2,
        volumeIndex: -2,
        z: i,
        width: 1920,
        height: 1080,
        fit: 'cover',
        blendMode: 'normal',
      });

      const controller = Controllers[mediaFile.mediaType];
      if (!controller) {
        console.info('No controller found for', mediaFile.mediaType, mediaFile);
        return;
      }
      // eslint-disable-next-line no-await-in-loop
      // await controller.preload({ action, file: mediaFile})
      newTracks.push({
        id: namedId('track'),
        name: mediaFile.name,
        file: mediaFile,
        controller: Controllers[mediaFile.mediaType] as IController,
        actions: [action] as IEditorAction[],
        controllerName: mediaFile.mediaType,
        fit: 'cover',
        blendMode: 'normal',
      } as IEditorTrack);
    }
    if (!addFile) {
      addFile = new EditorFile({name: 'New Video Project', tracks: newTracks});
      await addFile.preload(settings.editorId);

      dispatch({type: 'SET_FILE', payload: addFile as IEditorFile});
      dispatch({type: 'SET_SETTING', payload: {key: 'disabled', value: false}})
      fitScaleData(context, false,  components.timelineGrid)
    } else {
      const finalTracks = [...addFile.tracks, ...newTracks];
      dispatch({type: 'SET_TRACKS', payload: finalTracks as IEditorTrack[]});
    }
  };

  const handleClickLabel = (event: React.MouseEvent<HTMLElement, MouseEvent>, track: IEditorTrack) => {
    noFlagProps.onClickLabel?.(event, track);
    if (!flags.detailMode) {
      dispatch({type: 'SELECT_TRACK', payload: track});
      dispatch({type: 'DETAIL_OPEN'});
    }
  }

  const baseRef = React.useRef<HTMLDivElement>()
  const handleRef = useForkRef(baseRef, ref)

  const {...editorViewPropsNew} = editorViewProps;
  const {file: propsFile = null, fileUrl = '', actions} = noFlagProps;
  const finalEditorId = editorIdLocal || namedId('editor');
  React.useEffect(() => {
      dispatch({
        type: 'SET_SETTING',
        payload: {
          key: 'editorId',
          value: finalEditorId
        }
      });
    }, [])

  const [editorFile, setEditorFile] = React.useState<IEditorFile | null>(propsFile);
  React.useEffect(() => {
    if (editorFile !== propsFile && settings.editorId) {
      setEditorFile(propsFile);
      editorFile?.preload(settings.editorId).then(() => {
        console.info(`[${editorIdLocal}]`, '<Editor file::initialize() />', editorFile, editorFile.tracks.length);
        dispatch({type: 'SET_FILE', payload: editorFile});
      });
    }
  }, [propsFile])
  React.useEffect(() => {
    if (editorFile && settings.editorId) {
      editorFile.preload(settings.editorId).then(() => {
        console.info(`[${editorIdLocal}]`, '<Editor file::initialize() />', editorFile, editorFile.tracks.length);
        dispatch({type: 'SET_FILE', payload: editorFile});
      });
    } else if (!fileUrl) {
      engine.state = EngineState.READY;
      dispatch({type: 'SET_SETTING', payload: { key: 'disabled', value: true }})
    }
  }, [])

  const [editorFileUrl, setEditorFileUrl] = React.useState<string>('');
  React.useEffect(() => {
    if (fileUrl && fileUrl !== editorFileUrl) {
      setEditorFileUrl(fileUrl);
      EditorFile.fromUrl<EditorFile>(fileUrl, EditorFile)
      .then((urlFile) => {
        urlFile.preload(settings.editorId).then(() => {
          dispatch({type: 'SET_FILE', payload: urlFile as IEditorFile})
        })
      })
    }
  }, [fileUrl])

  /*
   if (actions) {
   EditorFile.fromActions<IEditorFileAction, IEditorAction, EditorFile>(actions)
   .then((timelineFile) => {
   dispatch({ type: 'SET_FILE', payload: timelineFile as EditorFile })
   })
   }
   */

  React.useEffect(() => {
    if (!baseRef?.current) {
      return undefined;
    }

    dispatch({type: 'SET_COMPONENT', payload: {key: 'editor', value: baseRef.current}});

    const observer = new ResizeObserver(() => {
      if (!rootRef) {
        return;
      }
      // const width = baseRef.current?.clientWidth;
      const settingKey = flags.detailMode ? 'detail' : undefined;
      const value = {
        width: baseRef.current?.clientWidth, height: baseRef.current?.clientHeight,
      }
      dispatch({type: 'SET_SETTING', payload: {key: settingKey, value}});
    });

    observer.observe(baseRef.current);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [baseRef?.current])

  const newRootProps = {...rootProps, ...rootProps.ownerState};
  const displayTimeline = getState && getState?.() !== 'LOADING';
  return (<Root
      role={'editor'}
      {...newRootProps}
      sx={[...(Array.isArray(sx) ? sx : [sx]),]}
      id={finalEditorId}
      fileView={fileView}
    >
      <EditorViewSlot
        {...editorViewPropsNew}
        ref={viewerRef}
        editorId={finalEditorId}
        viewButtons={inProps.viewButtons}
        viewButtonAppear={inProps.viewButtonAppear}
        viewButtonEnter={inProps.viewButtonEnter}
        viewButtonExit={inProps.viewButtonExit}
      >
        {inProps.children}
      </EditorViewSlot>
      <ControlsSlot
        role={'controls'}
        {...videoControlsProps}
        view={view}
        setView={setView}
        versions={[]}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
      />
      {displayTimeline && <TimelineSlot
        {...{...timelineProps, ...timelineProps.ownerState}}
        role={'timeline'}
        ref={timelineRef}
        id={`timeline-${settings?.editorId}`}
        controllers={Controllers}
        onKeyDown={instance.onKeyDown}
        viewSelector={`.MuiEditorView-root`}
        sx={noFlagProps.timelineSx}
        onAddFiles={onAddFiles}
        onContextMenuLabel={handleContextMenuLabel}
        onContextMenuTrack={handleContextMenuTrack}
        onContextMenuAction={handleContextMenuAction}
        onContextMenu={handleContextMenuLabel}
        onClickLabel={handleClickLabel}
        onClickTrack={noFlagProps.onClickTrack}
        onClickAction={noFlagProps.onClickAction}
      />}
      {flags && !flags.detailMode && <DetailModal/>}
    </Root>)
});

// FileExplorerProps: PropTypes.any,
Editor.propTypes = {

  actions: PropTypes.array,
  allControls: PropTypes.bool,
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef: PropTypes.any,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,

  detailMode: PropTypes.bool,

  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.object,

  file: PropTypes.any,

  filesSx: PropTypes.object,

  fileUrl: PropTypes.string,

  fileView: PropTypes.bool,

  fullscreen: PropTypes.bool,

  localDb: PropTypes.bool,

  minimal: PropTypes.bool,

  mode: PropTypes.oneOf(["project", "track", "action"]),

  newTrack: PropTypes.bool,

  noLabels: PropTypes.bool,

  noResizer: PropTypes.bool,

  noSaveControls: PropTypes.bool,

  noSnapControls: PropTypes.bool,

  noTrackControls: PropTypes.bool,

  noZoom: PropTypes.bool,

  openSaveControls: PropTypes.bool,

  preview: PropTypes.bool,

  record: PropTypes.bool,

  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,


  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object,]),


  viewButtonAppear: PropTypes.number,
  viewButtonEnter: PropTypes.number,

  viewButtonExit: PropTypes.number,
  viewButtons: PropTypes.any,

};

export default Editor;
