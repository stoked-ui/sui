import * as React from 'react';
import PropTypes from 'prop-types';
import Timeline, {
  ITimelineTrack,
  ITimelineAction,
  EngineState,
} from '@stoked-ui/timeline';
import Box from "@mui/material/Box";
import {namedId} from '@stoked-ui/common';
import {IMediaFile, MediaFile} from '@stoked-ui/media-selector';
import {useSlotProps} from '@mui/base/utils';
import {useTheme} from "@mui/material";
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
import {getTracksFromMediaFiles, IEditorTrack} from "../EditorTrack/EditorTrack";
import EditorFile, {IEditorFile} from "../EditorFile/EditorFile";
import EditorFileTabs from '../EditorFileTabs';

const useThemeProps = createUseThemeProps('MuiEditor');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(ownerState: EditorProps<R, Multiple>,) => {
  const {classes} = ownerState;

  const slots = {
    root: ['root'],
    editorView: ['editorView'],
    controls: ['controls'],
    timeline: ['timeline'],
    fileExplorerTabs: ['fileExplorerTabs'],
    fileExplorer: ['fileExplorer'],
    loaded: ['loaded'],
  };

  return composeClasses(slots, getEditorUtilityClass, classes);
};

const EditorRoot = styled(Box, {
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
                               && prop !== 'trackCount'
                               && prop !== 'detail'
                               && prop !== 'fullscreen',
})<{ fullscreen: boolean, fileView: boolean, trackCount: number, detail: boolean }>(({theme, fullscreen, fileView, trackCount, detail}) => {
  const width = fullscreen ? '100vw' : '100%';
  const height = fullscreen ? '100vh' : '100%';
  const timelineHeight = 37 + (36 * trackCount);
  const gridTemplate = detail ? {
    gridTemplateAreas: `
      "viewer"
      "controls"
      "timeline"`,
    gridTemplateRows: `min-content min-content auto`,
  } : {
    gridTemplateAreas: `
      "viewer"
      "controls"
      "timeline"
      "explorer-tabs"`,
    gridTemplateRows: `min-content min-content auto 0px`,
    '&.MuiEditor-loaded': {
      gridTemplateAreas: `
      "viewer"
      "controls"
      "timeline"
      "explorer-tabs"`,
      gridTemplateRows: `min-content min-content ${timelineHeight}px 49px`,
    },
  }
  return {
    display: "grid",
    flexDirection: 'column',
    containerType: 'inline-size',
    width,
    height,
    ...gridTemplate,
    '& .MuiEditorView-root': {
      overflow: 'hidden',
    },
    overflow: 'hidden',
  }
});

interface TimelineSlotProps {
  trackActions?: any
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

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
  const {fileView, videos, trackFiles } = settings;
  const {id: editorIdLocal, ...inProps} = inPropsId;

  const defaultSx = inProps.fullscreen || flags?.fullscreen ? {} : {borderRadius: '6px 6px 0 0'}
  const {sx = defaultSx, ...props} = useThemeProps({props: inProps, name: 'MuiEditor'});
  const {
    noLabels,
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
      minimal,
      externalKeydown: true,
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
    getFileExplorerTabsProps,
    instance
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS, rootRef: ref, props,
  });

  const {slots, slotProps} = props;
  const classes = useUtilityClasses({...props, loaded: (!!file && !engine.isLoading)});
  const Root = slots?.root ?? EditorRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: `${classes.root} ${!!file && !engine.isLoading ? classes.loaded : '' }`,
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
    ownerState: {...noFlagProps, trackActions: EditorTrackActions} as any,
  });

  const ExplorerTabs = slots?.fileExplorer ?? EditorFileTabs;
  const fileExplorerTabsProps = useSlotProps({
    elementType: ExplorerTabs,
    externalSlotProps: slotProps?.fileExplorerTabs,
    className: classes.fileExplorerTabs,
    getSlotProps: getFileExplorerTabsProps,
    ownerState: inProps.fileExplorerTabsProps as any,
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

  const [currentVersion, setCurrentVersion] = React.useState<string>()

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
    const addFile = file;

    if (!newMediaFiles.length) {
      return;
    }

    const extractedFiles = await Promise.all(newMediaFiles.map(async (mediaFile) => {
      await mediaFile.extractMetadata();
      return mediaFile;
    }));

    const newTracks = getTracksFromMediaFiles(extractedFiles, engine.time, addFile?.tracks);
    // if (!addFile) {
    //  addFile = new EditorFile({name: 'New Video Project', tracks: newTracks});
    //  await addFile.preload(settings.editorId);

    //  dispatch({type: 'SET_FILE', payload: addFile as IEditorFile});
    //  dispatch({type: 'SET_SETTING', payload: {key: 'disabled', value: false}})
    //  fitScaleData(context, false,  components.timelineGrid, 'editor')
   // } else {
    if (addFile) {
      dispatch({type: 'SET_TRACKS', payload: newTracks as IEditorTrack[]});
    } else {
      const newFile = new EditorFile({name: 'New Video Project', tracks: newTracks});
      await newFile.preload(settings.editorId);

      dispatch({type: 'SET_FILE', payload: newFile as IEditorFile});
      dispatch({type: 'SET_SETTING', payload: {key: 'disabled', value: false}})
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
      dispatch({
        type: 'SET_SETTING',
        payload: {
          key: 'componentId',
          value: finalEditorId
        }
      });
    }, [])

  const [editorFile, setEditorFile] = React.useState<IEditorFile | null>(propsFile);
  React.useEffect(() => {
    if (editorFile !== propsFile && settings.editorId) {
      alert('3')
      setEditorFile(propsFile);
      console.info('Editor::preload()', propsFile, propsFile?.tracks.length);
      propsFile?.preload(settings.editorId).then(() => {
        console.info(`[${editorIdLocal}]`, 'Editor dispatch::SET_FILE()', editorFile, propsFile.tracks.length);
        dispatch({type: 'SET_FILE', payload: propsFile});
      });
    }
  }, [propsFile]);

  React.useEffect(() => {
    if (editorFile && settings.editorId) {
      alert('new file')
      editorFile.preload(settings.editorId).then(() => {
        console.info(`[${editorIdLocal}]`, '<Editor file::preload() />', editorFile, editorFile.tracks.length);
        dispatch({type: 'SET_FILE', payload: editorFile});
      }).catch((error) => {
        engine.state = EngineState.READY;
        console.error(`[${editorIdLocal}]`, '<Editor file::preload() />', error);
      });
    } else if (!fileUrl) {
      engine.state = EngineState.READY;
      dispatch({type: 'SET_SETTING', payload: { key: 'disabled', value: true }})
    }
  }, [])

  const [editorFileUrl, setEditorFileUrl] = React.useState<string>('');
  React.useEffect(() => {
    if (fileUrl && fileUrl !== editorFileUrl) {
      alert('new file 2')
      setEditorFileUrl(fileUrl);
      EditorFile.fromUrl<EditorFile>(fileUrl, EditorFile)
      .then((urlFile) => {
        if (urlFile) {
          urlFile.preload(settings.editorId).then(() => {
            dispatch({type: 'SET_FILE', payload: urlFile as IEditorFile})
          })
        } else {
          engine.state = EngineState.READY;
        }
      })
    }
  }, [fileUrl])

  const [view, setView] = React.useState<'timeline' | 'files'>('timeline')

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
  const drawerHeight = 240;
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const newRootProps = {...rootProps, ...rootProps.ownerState};
  const displayTimeline = getState && getState?.() !== 'LOADING';

  return (<Root
      role={'editor'}
      detail={flags.detailMode}
      trackCount={file?.tracks?.length || 0}
      {...newRootProps}
      sx={[{ position: 'relative', overflow:'visible'}, ...(Array.isArray(sx) ? sx : [sx]),]}
      id={finalEditorId}
      fileView={flags.fileView}
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
        internalComponent={true}
        onContextMenuLabel={handleContextMenuLabel}
        onContextMenuTrack={handleContextMenuTrack}
        onContextMenuAction={handleContextMenuAction}
        onContextMenu={handleContextMenuLabel}
        onClickLabel={handleClickLabel}
        onClickTrack={noFlagProps.onClickTrack}
        onClickAction={noFlagProps.onClickAction}
      />}

    {!flags.detailMode &&
      <ExplorerTabs
        role={'file-explorer-tabs'}
        id={'editor-file-explorer-tabs'}
        {...fileExplorerTabsProps}
        sx={[inProps.fileTabsSx, ...(Array.isArray(fileExplorerTabsProps.sx) ? fileExplorerTabsProps.sx : [fileExplorerTabsProps.sx]),]}
        variant={'drawer'}
      />
    }
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

  fileTabsSx: PropTypes.object,

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
