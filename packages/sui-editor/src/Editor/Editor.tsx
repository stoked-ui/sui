/**
 * @typedef {import('@stoked-ui/timeline').ITimelineTrack} ITimelineTrack
 * @typedef {import('@stoked-ui/timeline').ITimelineAction} ITimelineAction
 * @typedef {import('@stoked-ui/timeline').EngineState} EngineState
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import Timeline from '@stoked-ui/timeline';
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

/**
 * @typedef {Object} TimelineSlotProps
 * @property {any} [trackActions]
 */

/**
 * @description Component for editing videos with a timeline and controls.
 * @param {EditorProps<IMediaFile, boolean | undefined>} inPropsId - Props for the editor component.
 * @param {React.Ref<HTMLDivElement>} ref - Reference object for editor component manipulation.
 * @returns {JSX.Element} Rendered editor component.
 * @example
 * <Editor {...props} />
 */
const Editor = React.forwardRef(function Editor(inPropsId, ref) {
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
  } = useEditor({
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

  const viewerRef = React.useRef(null);
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

  const [currentVersion, setCurrentVersion] = React.useState(null);

  React.useEffect(() => {
    if (settings && !settings.editorMode) {
      dispatch({ type: 'SET_SETTING', payload: {key: 'editorMode', value: noFlagProps.mode ?? 'project'}});
    }
  }, [noFlagProps.mode])

  const timelineRef = React.useRef(null);
  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenuAction = (event, param) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.action, type: 'action'
    });
  };

  const handleContextMenuTrack = (event, param) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2, mouseY: event.clientY - 6, context: param.track, type: 'track'
    });
  };

  const handleContextMenuLabel = (event, param) => {
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
    });

    const newTracks = getTracksFromMediaFiles(extractedFiles, engine.time, addFile?.tracks);

    if (addFile) {
      dispatch({type: 'SET_TRACKS', payload: newTracks as IEditorTrack[]});
    } else {
      const newFile = new EditorFile({name: 'New Video Project', tracks: newTracks});
      await newFile.preload(settings.editorId);

      dispatch({type: 'SET_FILE', payload: newFile as IEditorFile});
      dispatch({type: 'SET_SETTING', payload: {key: 'disabled', value: false}})
    }
  };

  const handleClickLabel = (event, track) => {
    noFlagProps.onClickLabel?.(event, track);
    if (!flags.detailMode) {
      dispatch({type: 'SELECT_TRACK', payload: track});
      dispatch({type: 'DETAIL_OPEN'});
    }
  }

  const baseRef = React.useRef(null)
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

  const [editorFile, setEditorFile] = React.useState(null);
  React.useEffect(() => {
    if (editorFile !== propsFile && settings.editorId) {
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

  const [editorFileUrl, setEditorFileUrl] = React.useState('');
  React.useEffect(() => {
    if (fileUrl && fileUrl !== editorFileUrl) {
      setEditorFileUrl(fileUrl);
      EditorFile.fromUrl(fileUrl, EditorFile)
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

  const [view, setView] = React.useState('timeline')

  React.useEffect(() => {
    if (!baseRef?.current) {
      return undefined;
    }

    dispatch({type: 'SET_COMPONENT', payload: {key: 'editor', value: baseRef.current}});

    const observer = new ResizeObserver(() => {
      if (!rootRef) {
        return;
      }
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

Editor.propTypes = {
  actions: PropTypes.array,
  allControls: PropTypes.bool,
  apiRef: PropTypes.any,
  classes: PropTypes.object,
  className: PropTypes.string,
  detailMode: PropTypes.bool,
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
  slotProps: PropTypes.object,
  slots: PropTypes.object,
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object,]),
  viewButtonAppear: PropTypes.number,
  viewButtonEnter: PropTypes.number,
  viewButtonExit: PropTypes.number,
  viewButtons: PropTypes.any,
};

export default Editor;