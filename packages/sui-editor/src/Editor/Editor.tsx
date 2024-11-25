import * as React from 'react';
import PropTypes from 'prop-types';
import Timeline, {
  ITimelineTrack,
  ITimelineAction,
  TimelineFile,
  WebFile,
  IController,
  FileState,
  EngineState,
  TimelineProps, TimelineControlProps
} from '@stoked-ui/timeline';
import {  FileExplorer } from '@stoked-ui/file-explorer';
import { IMediaFile, MediaFile, namedId } from '@stoked-ui/media-selector';
import {SlotComponentProps, useSlotProps} from '@mui/base/utils';
import { SxProps } from "@mui/material";
import composeClasses from '@mui/utils/composeClasses';
import { createUseThemeProps, styled} from '../internals/zero-styled';
import { useEditor } from '../internals/useEditor';
import { EditorProps} from './Editor.types';
import { EditorPluginSignatures, VIDEO_EDITOR_PLUGINS } from './Editor.plugins';
import {  EditorControls } from '../EditorControls/EditorControls';
import EditorView from '../EditorView';
import { getEditorUtilityClass } from './editorClasses';
import Controllers from "../Controllers";
import DetailModal from "../DetailView/DetailView";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { IEditorAction, IEditorFileAction, initEditorAction } from "../EditorAction/EditorAction";
import {IEditorFileTrack, IEditorTrack} from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile } from "../EditorFile/EditorFile";
import {IEditorEngine} from "../EditorEngine";

const useThemeProps = createUseThemeProps('MuiEditor');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(
  ownerState: EditorProps<R, Multiple>,
) => {
  const { classes } = ownerState;

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
  shouldForwardProp: (prop) =>
    prop !== 'allControls'
    && prop !== 'ownerState'
    && prop !== 'fileUrl'
    && prop !== 'noSaveControls'
    && prop !== 'record'
    && prop !== 'noSnapControls'
    && prop !== 'noTrackControls',

})(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '& .lottie-canvas': {
    width: '50%',
    backgroundColor: '#ffff00',
  },
  '& .player-panel': {
    width: '100%',
    height: '500px',
    position: 'relative',
    '& .lottie-ani': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    },
  },
  '& .MuiEditorView-root': {
    overflow: 'hidden',
  },
  overflow: 'hidden',
}));


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
  const blob = new Blob([JSON.stringify(versionDir)], { type: "inode/directory" });
  const url = URL.createObjectURL(blob);
  const versionFile = new File([blob], versionDir.name, { type: 'inode/directory' });
  const mediaFile =  MediaFile.fromFile(versionFile as IMediaFile);
  mediaFile.children = children;
  return mediaFile;
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
const Editor = React.forwardRef(function Editor<
  R extends IMediaFile = IMediaFile,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const {
    editorId,
    file,
    flags,
    engine,
    dispatch,
    getState,
    settings
  } = useEditorContext();

  const { sx = { borderRadius: '6px' }, ...props } = useThemeProps({ props: inProps, name: 'MuiEditor' });

  React.useEffect(() => {
    const set = ['noLabels', 'fileView', 'trackControls', 'snapControls', 'localDb', 'openSaveControls', 'record', 'noResizer', 'allControls', 'detailMode', 'minimal'];
    const values = set.filter((s) => inProps[s]);

    dispatch({ type: 'SET_FLAGS', payload: { add: values, remove: [] } });
  }, []);

  const {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getFileExplorerProps,
    instance
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS,
    rootRef: ref,
    props,
  });

  const { slots, slotProps } = props;
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
    ownerState: { ...props },
  });

  const ControlsSlot = slots?.controls ?? EditorControls;
  const videoControlsProps = useSlotProps({
    elementType: ControlsSlot,
    externalSlotProps: slotProps?.controls,
    className: classes.controls,
    getSlotProps: getControlsProps,
    ownerState: { ...props },
  });

  const TimelineSlot = slots?.timeline ?? Timeline;
  const timelineProps = useSlotProps({
    elementType: TimelineSlot,
    externalSlotProps: slotProps?.timeline,
    className: classes.timeline,
    getSlotProps: getTimelineProps,
    ownerState: inProps as any,
  });

  const Explorer = slots?.fileExplorer ?? FileExplorer;
  const fileExplorerProps = useSlotProps({
    elementType: Explorer,
    externalSlotProps: slotProps?.fileExplorer,
    className: classes.fileExplorer,
    getSlotProps: getFileExplorerProps,
    ownerState: props as any,
  });

  const viewerRef = React.useRef<HTMLDivElement>(null);


  const [startIt, setStartIt] = React.useState(false);
  React.useEffect(() => {

    if (!startIt && engine.isLoading && viewerRef.current) {
      setStartIt(true);
      engine.viewer = viewerRef.current;

      dispatch({
        type: 'VIEWER',
        payload: viewerRef.current
      });

    }
  }, [viewerRef.current, engine, engine.isLoading]);

  const [mediaFiles, setMediaFiles] = React.useState<IMediaFile[]>([]);
  const [files, setFiles] = React.useState<IMediaFile[]>([]);
  const [saved, setSaved] = React.useState<IMediaFile[]>([])
  const [view, setView] = React.useState<'timeline' | 'files'>('timeline')
  const hiddenSx: SxProps = {
    position: 'absolute!important',
    opacity: '0!important',
    left: '200%'
  };
  const visibleSx: SxProps = { position: 'static!important', opacity: '1!important' };
  const timelineSx = { ...(view === 'files' ? hiddenSx : visibleSx), width: '100%' };
  const filesSx = view !== 'files' ? hiddenSx : visibleSx;
  const [currentVersion, setCurrentVersion] = React.useState<string>()

  React.useEffect(() => {
    const actionFilesFolder = createDirectoryFile({ dirname: 'Tracks', children: mediaFiles })
    const versionDir = createDirectoryFile({ dirname: 'Versions', children: saved })
    setFiles([actionFilesFolder, versionDir]);

  }, [mediaFiles, saved])


  React.useEffect(() => {
    if (!settings.editorMode ) {
      dispatch({type: 'SET_SETTING', payload: {key: 'editorMode', value: inProps.mode ?? 'project'}});
    }
  }, [inProps.mode])

    /*
  React.useEffect(() => {
    if (file?.tracks) {
      const trackFiles = file.tracks.map((track) => track.file);
      // const tFiles: IMediaFile[] = trackFiles.filter((tf) => tf !== undefined);
      // setMediaFiles(tFiles);
    }
    // if (versions?.length) {
    //   setSaved(versions);
    // }
  }, [currentVersion, versions, engine]);
*/



  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    context: ITimelineTrack | ITimelineAction;
    type: 'action' | 'track' | 'label'
  } | null>(null);

  const handleContextMenuAction = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: {
    action: ITimelineAction;
    track: ITimelineTrack;
    time: number;
  }) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      context: param.action,
      type: 'action'
    });
  };

  const handleContextMenuTrack = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: {
    track: ITimelineTrack;
    time: number;
  }) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      context: param.track,
      type: 'track'
    });
  };

  const handleContextMenuLabel = (event: React.MouseEvent<HTMLElement, MouseEvent>, param: {
    track: ITimelineTrack;
    time: number;
  }) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      context: param.track,
      type: 'label'
    });
  };

  const onAddFiles = () => {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';
    input.onchange = async (ev) => {
      let newMediaFiles = await MediaFile.from(ev)

      if (!file) {
        return;
      }

      newMediaFiles = newMediaFiles.filter((mediaFile) => engine.controllers[mediaFile.mediaType])

      const newTracks: IEditorTrack[] = [];
      for (let i = 0; i < newMediaFiles.length; i += 1) {
        const mediaFile = newMediaFiles[i];
        const action = {
          id: namedId('action'),
          name: file.name,
          start: engine.time || 0,
          end: (engine.time || 0) + 2,
          volumeIndex: -2,
          z: i,
          width: 1920,
          height: 1080,
          fit: 'none',
          blendMode: 'normal',
          controller: Controllers[mediaFile.mediaType],
        } as IEditorAction;

        const controller = Controllers[mediaFile.mediaType];
        if (!controller) {
          console.info('No controller found for', mediaFile.mediaType, mediaFile);
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await controller.preload({ action, file: mediaFile})
        newTracks.push({
          id: namedId('track'),
          name: mediaFile.name,
          file: mediaFile,
          controller: controller as IController,
          actions: [action] as IEditorAction[],
          controllerName: mediaFile.mediaType,
          fit: 'none',
          blendMode: 'normal',
        } as IEditorTrack);
      }
      const finalTracks = [...file.tracks, ...newTracks];
      console.info('finalTracks', finalTracks);
      dispatch({ type: 'SET_TRACKS', payload: finalTracks as IEditorTrack[] });
    }
    input.click();
  };

  const handleClickLabel = (event: React.MouseEvent<HTMLElement, MouseEvent>, track: ITimelineTrack) => {
    inProps.onClickLabel?.(event, track);
    if (!flags.detailMode) {
      dispatch({ type: 'DETAIL_OPEN'});
    }
  }


  const { ...editorViewPropsNew } = editorViewProps;

  React.useEffect(() => {
    const editorElement = document.getElementById(editorId);
    if (editorElement) {
      dispatch({ type: 'SET_COMPONENT', payload: { key: 'editor', value: editorElement } });
    }
    if (inProps.file) {
      const inputFile = inProps.file as IEditorFile;
       inputFile.initialize(inputFile.trackFiles ?? []).then(() => {
           dispatch({ type: 'SET_FILE', payload: inputFile});
        })
    } else if (inProps.fileUrl) {
      WebFile.fromUrl<EditorFile>(inProps.fileUrl)
        .then((timelineFile) => {
          dispatch({ type: 'SET_FILE', payload: timelineFile as IEditorFile})
        })
    } else if (inProps.actions) {
      TimelineFile.fromActions<IEditorFileAction, IEditorAction, EditorFile>(inProps.actions)
        .then((timelineFile) => {
          dispatch({ type: 'SET_FILE', payload: timelineFile as EditorFile })
        })
    } else {
      engine.state = EngineState.READY;
    }

  }, [])

  const newRootProps = { ...rootProps, ...rootProps.ownerState };
  const displayTimeline = !flags?.fileView && getState() !== 'LOADING';
  return (
    <Root role={'editor'} {...newRootProps} sx={sx} id={editorId}>
      <EditorViewSlot {...editorViewPropsNew} ref={viewerRef} />
      <ControlsSlot
        role={'controls'}
        {...videoControlsProps}
        view={view}
        setView={setView}
        versions={[]}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
        disabled={engine.isLoading}
      />
      {displayTimeline &&
        <React.Fragment>
         <TimelineSlot
            role={'timeline'}
            {...timelineProps}
            ref={timelineRef}
            controllers={Controllers}
            onKeyDown={instance.onKeyDown}
            viewSelector={`.MuiEditorView-root`}
            sx={timelineSx}
            disabled={engine.isLoading}
            onContextMenuLabel={handleContextMenuLabel}
            onContextMenuTrack={handleContextMenuTrack}
            onContextMenuAction={handleContextMenuAction}
            onContextMenu={handleContextMenuLabel}
            onClickLabel={handleClickLabel}
            onClickTrack={inProps.onClickTrack}
            onClickAction={inProps.onClickAction}
          />
          {flags.fileView && <Explorer
            grid
            role={'file-explorer'}
            id={'editor-file-explorer-renderer'}
            {...fileExplorerProps}
            items={files}
            dndInternal
            dndExternal
            alternatingRows
            defaultExpandedItems={['tracks']}
            sx={[filesSx, { display: 'none'}]}
            onAddFiles={onAddFiles}
          />}

        </React.Fragment>
      }

      {!flags.detailMode && <DetailModal />}

    </Root>)
});

Editor.propTypes = {
  actions: PropTypes.array, allControls: PropTypes.bool, /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef: PropTypes.any, /**
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

  fileUrl: PropTypes.string,

  fileView: PropTypes.bool,

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

  record: PropTypes.bool, /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object, /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object, /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object,]),

};

export default Editor;
