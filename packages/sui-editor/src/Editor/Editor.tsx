import * as React from 'react';
import PropTypes from 'prop-types';
import Timeline, { ITimelineTrack, ITimelineAction, TimelineFile, WebFile, IController, FileState } from '@stoked-ui/timeline';
import {  FileExplorer } from '@stoked-ui/file-explorer';
import { IMediaFile, MediaFile, namedId } from '@stoked-ui/media-selector';
import { useSlotProps} from '@mui/base/utils';
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
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import EditorFile, { IEditorFile } from "../EditorFile/EditorFile";

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
    && prop !== 'openSaveControls'
    && prop !== 'record'
    && prop !== 'snapControls'
    && prop !== 'trackControls',

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
    id,
    file,
    flags,
    engine,
    versions,
    dispatch
  } = useEditorContext();

  const { sx = { borderRadius: '6px' }, ...props } = useThemeProps({ props: inProps, name: 'MuiEditor' });

  React.useEffect(() => {


    const set = ['labels', 'fileView', 'trackControls', 'snapControls', 'localDb', 'openSaveControls', 'record', 'noResizer', 'allControls', 'detailMode', 'minimal'];
    const values = set.filter((s) => inProps[s]);

    if (!values.filter((s) => ['minimal', 'detailMode'].includes(s)).length || !flags.includes('isMobile')) {
      values.push('labels');
    }
    // dispatch({ type: 'SET_SETTING', payload: {key: 'timeline', value: { startLeft: 72 }}});
    dispatch({ type: 'INITIAL_FLAGS', payload: { set, values } });
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
    ownerState: inProps,
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
    if (file?.tracks) {
      const trackFiles = file.tracks.map((track) => track.file);
      // const tFiles: IMediaFile[] = trackFiles.filter((tf) => tf !== undefined);
      // setMediaFiles(tFiles);
    }
    if (versions?.length) {
      setSaved(versions);
    }
  }, [currentVersion, versions, engine]);



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

      const newTracks: ITimelineTrack[] = [];
      for (let i = 0; i < newMediaFiles.length; i += 1) {
        const mediaFile = newMediaFiles[i];
        const action = {
          id: namedId('action'),
          name: file.name,
          start: engine.time || 0,
          end: (engine.time || 0) + 2,
          volumeIndex: -2,
        } as ITimelineAction;

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
          actions: [action] as ITimelineAction[],
          controllerName: mediaFile.mediaType,
        } as ITimelineTrack);
      }
      console.log('dispatch', "CREATE_TRACKS");
      dispatch({ type: 'CREATE_TRACKS', payload: newTracks });
    }
    input.click();
  };

  const onLabelClick = (t: IEditorTrack) => {
    dispatch({ type: 'TRACK_DETAIL', payload: t as IEditorTrack});
  }

  const { ...editorViewPropsNew } = editorViewProps;

  React.useEffect(() => {
    const editorElement = document.getElementById(id);
    if (editorElement) {
      dispatch({ type: 'SET_COMPONENT', payload: { key: 'editor', value: editorElement } });
    }
    if (inProps.file) {
      const inputFile: EditorFile = inProps.file as EditorFile;
       inputFile.initialize().then(() => {
           dispatch({ type: 'SET_FILE', payload: inputFile as EditorFile });
        })
    } else if (inProps.fileUrl) {
      WebFile.fromUrl<EditorFile>(inProps.fileUrl)
        .then((timelineFile) => {
          dispatch({ type: 'SET_FILE', payload: timelineFile as EditorFile })
        })
    } else if (inProps.actions) {
      TimelineFile.fromActions<IEditorFileAction, IEditorAction, EditorFile>(inProps.actions)
        .then((timelineFile) => {
          dispatch({ type: 'SET_FILE', payload: timelineFile as EditorFile })
        })
    }

  }, [])

  const newRootProps = { ...rootProps, ...rootProps.ownerState };
  const displayTimeline = !flags.includes('fileView') && engine && !engine.isLoading && file && file.state === FileState.READY;
  return (
    <Root role={'editor'} {...newRootProps} sx={sx} id={id}>
      <EditorViewSlot {...editorViewPropsNew} ref={viewerRef} />
      <ControlsSlot
        role={'controls'}
        {...videoControlsProps}
        view={view}
        setView={setView}
        versions={versions}
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
            onAddFiles={onAddFiles}
            onLabelClick={onLabelClick}
            onActionClick={(action: ITimelineAction) => dispatch({type: 'SELECT_ACTION', payload: action as any})}
            onTrackClick={(track: ITimelineTrack) => dispatch({type: 'SELECT_TRACK', payload: track as any})}
          />
          {flags.includes('fileView') && <Explorer
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

      <DetailModal />

    </Root>)
});

Editor.propTypes = {
  actions: PropTypes.array,
  allControls: PropTypes.bool,
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef: PropTypes.any, /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  detailMode: PropTypes.bool,
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.object,

  file: PropTypes.any,

  fileUrl: PropTypes.string,

  fileView: PropTypes.bool,

  labels: PropTypes.bool,

  localDb: PropTypes.bool,

  minimal: PropTypes.bool,

  noResizer: PropTypes.bool,

  openSaveControls: PropTypes.bool,

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
  snapControls: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  trackControls: PropTypes.bool,

};

export default Editor;
