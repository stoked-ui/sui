import * as React from 'react';
import PropTypes from 'prop-types';
import { ITimelineFileAction, ITimelineFile } from '@stoked-ui/timeline';
import { FileBase, FileExplorer } from '@stoked-ui/file-explorer';
import { IMediaFile } from '@stoked-ui/media-selector';
import { useSlotProps} from '@mui/base/utils';
import { SxProps } from "@mui/material";
import composeClasses from '@mui/utils/composeClasses';
import { Timeline, type TimelineState, FilesFromActions, ITimelineTrack, ViewMode} from '@stoked-ui/timeline';
import { createUseThemeProps, styled} from '../internals/zero-styled';
import { useEditor } from '../internals/useEditor';
import { EditorProps, type Version } from './Editor.types';
import { EditorPluginSignatures, VIDEO_EDITOR_PLUGINS } from './Editor.plugins';
import { type ControlState, EditorControls } from '../EditorControls';
import { EditorView } from '../EditorView';
import { getEditorUtilityClass } from './editorClasses';
import { EditorLabels } from '../EditorLabels';
import Controllers from "../Controllers";
import EditorEngine from "../EditorEngine/EditorEngine";
import initDb from '../db/init'

const useThemeProps = createUseThemeProps('MuiEditor');

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: EditorProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    editorView: ['editorView'],
    videoControls: ['videoControls'],
    timeline: ['timeline'],
    fileExplorer: ['fileExplorer'],
  };

  return composeClasses(slots, getEditorUtilityClass, classes);
};

const EditorRoot = styled('div', {
  name: 'MuiEditor',
  slot: 'root',
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


/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/editor/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/editor/api/)
 */
const Editor = React.forwardRef(function Editor<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const { sx, ...props } = useThemeProps({ props: inProps, name: 'MuiEditor' });
  const [video, setVideo] = React.useState<ITimelineFile | null>(inProps.file ?? null)
  const {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getFileExplorerProps,
    id,
    instance
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS,
    rootRef: ref,
    props,
  });

  const [tracks, setTracksBase] = React.useState<ITimelineTrack[] | null>(inProps.tracks ?? null);
  const setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[] | null>> = (tracksUpdater) => {
    if (typeof tracksUpdater === "function") {
      setTracksBase((prevTracks) => {
        if (tracks) {
          const updatedTracks = tracksUpdater(tracks);
          if (updatedTracks) {
            engineRef.current.tracks = updatedTracks;
          }
          return updatedTracks
        }
        return tracksUpdater(prevTracks);
      });

    } else if (tracksUpdater) {
      setTracksBase(tracksUpdater);
      engineRef.current.tracks = tracksUpdater;
    }
  };


  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);
  const [mode, setMode] = React.useState<ViewMode>('Renderer');

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
    ownerState: {...props, video},
  });

  const ControlsSlot = slots?.videoControls ?? EditorControls;
  const videoControlsProps = useSlotProps({
    elementType: ControlsSlot,
    externalSlotProps: slotProps?.videoControls,
    className: classes.videoControls,
    getSlotProps: getControlsProps,
    ownerState: {...props, mode, setMode},
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

  const timelineState = React.useRef<TimelineState>(null);
  const engineRef = React.useRef<EditorEngine>(new EditorEngine({
    id,
    controllers: Controllers,
    defaultState: 'paused' as ControlState,
    file: video,
    setFile: setVideo
  }));

  engineRef.current.setFile = setVideo;
  engineRef.current.control.timelineProps = timelineProps;
  engineRef.current.setTracks = setTracks;

  const viewerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    initDb('video').then((initResults) => {
      // co nsole.log('db init results', initResults);
    });
  }, []);

  const [startIt, setStartIt] = React.useState(false);
  React.useEffect(() => {

    if (!startIt && viewerRef.current && engineRef.current) {
      engineRef.current.viewer = viewerRef.current;
      setStartIt(true);
    }
  }, [viewerRef.current,  engineRef.current]);

  const [mediaFiles, setMediaFiles] = React.useState<FileBase[]>([]);
  const [files, setFiles] = React.useState<FileBase[]>([]);
  const [saved, setSaved] = React.useState<FileBase[]>([])
  const [versions, setVersions] = React.useState<Version[]>([]);
  // const [versionFiles, setVersionFiles] = React.useState<FileBase[]>([]);
  const [view, setView] = React.useState<'timeline' | 'files'>('timeline')
  const hiddenSx: SxProps = {position: 'absolute!important', opacity: '0!important', left: '200%'};
  const visibleSx: SxProps = {position: 'static!important', opacity: '1!important'};
  const timelineSx = {...(view === 'files' ? hiddenSx : visibleSx),  width: '100%'};
  const filesSx = view !== 'files' ? hiddenSx : visibleSx ;
  const [currentVersion, setCurrentVersion] = React.useState<string>()

  React.useEffect(() => {
    const actionFilesFolder: FileBase = {
      id: 'tracks',
      label: 'Tracks',
      expanded: true,
      selected: true,
      type: 'folder',
      children: mediaFiles,
    };
    const versionsFolder: FileBase = {
      id: 'versions',
      label: 'Versions',
      expanded: true,
      selected: true,
      type: 'folder',
      children: saved,
    }
    setFiles([actionFilesFolder, versionsFolder]);

  }, [mediaFiles, saved])

  React.useEffect(() => {
    const actions = engineRef.current.actions ? Object.values(engineRef.current.actions) : undefined;
    if (actions?.length) {
      const actionFiles  = FilesFromActions(actions) as FileBase[];
      setMediaFiles(actionFiles);
    }
    if (versions?.length) {
      engineRef.current.versionFiles()
        .then((latestVersionFiles) => {
          setSaved(latestVersionFiles);
        })
    }

  }, [currentVersion, versions, engineRef.current?.actions])
  const timelineRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (timelineState?.current && startIt) {
      if (inProps.tracks?.length) {
        engineRef.current?.setTracks?.(inProps.tracks)
      } else if (inProps.file?.actionData?.length) {
        engineRef.current?.buildTracks(Controllers, inProps.file.actionData)
          .then((initialTracks) => {
            if (engineRef.current) {
              engineRef.current?.setTracks?.(initialTracks)
            }
          });
      }
    }
  }, [timelineState?.current, startIt])

  const onAddFiles = (newMediaFiles: IMediaFile[]) => {

    if (!timelineState.current || !(timelineState.current as TimelineState)?.engine) {
      return;
    }
    const engine = timelineState.current.engine;
    const actionInput: ITimelineFileAction[] = newMediaFiles.map((file) => {
      return {
        id: file.id,
        name: file.name,
        start: timelineState.current?.getTime() || 0,
        end: (timelineState.current?.getTime() || 0) + 2,
        controllerName: file.mediaType,
        src: file.url,
      };
    });

    const actions: ITimelineFileAction[] = Object.values(engine.actions);
    const input = actions.concat(actionInput);
    engine.buildTracks(Controllers, input)
      .then((builtTracks : ITimelineTrack[]) => {
        timelineState.current?.setTracks(builtTracks);
      });
  }

  return (<Root role={'editor'} {...rootProps} >
    <EditorViewSlot {...editorViewProps} ref={viewerRef}
                    setTracks={timelineState.current?.setTracks} tracks={tracks} engine={engineRef.current}
                    video={video}/>
    {startIt && <ControlsSlot
      role={'controls'}
      {...videoControlsProps}
      view={view}
      mode={mode}
      setMode={setMode}
      setView={setView}
      engineRef={engineRef}
      versions={versions}
      setVersions={setVersions}
      currentVersion={currentVersion}
      setCurrentVersion={setCurrentVersion}
    />}
    {startIt && <TimelineSlot
      role={'timeline'}
      {...timelineProps}
      ref={timelineRef}
      controllers={Controllers}
      timelineState={timelineState}
      file={inProps.file}
      onKeyDown={instance.onKeyDown}
      viewSelector={`.MuiEditorView-root`}
      slots={{labels: EditorLabels}}
      labels
      engineRef={engineRef}
      sx={timelineSx}
      tracks={tracks}
      setTracks={setTracks}
      onAddFiles={onAddFiles}
    />}
    {engineRef.current.viewMode === 'Renderer' && (files?.length ?? -1) > 0 && <Explorer
        grid
        role={'file-explorer'}
        id={'editor-file-explorer-renderer'}
        {...fileExplorerProps}
        items={files}
        dndInternal
        dndExternal
        alternatingRows
        defaultExpandedItems={['tracks']}
        sx={filesSx}
        onAddFiles={onAddFiles}
      />}
    {engineRef.current.viewMode === 'Screener' && (saved?.length ?? -1) > 0 && <Explorer
      grid
      role={'file-explorer'}
      id={'editor-file-explorer-screener'}
      {...fileExplorerProps}
      items={saved}
      dndInternal
      dndExternal
      alternatingRows
      defaultExpandedItems={['versions']}
      sx={filesSx}
      onAddFiles={onAddFiles}
    />}
  </Root>);
});

Editor.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  file: PropTypes.any,
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with
   * `useEditorApiRef()`.
   */
  apiRef: PropTypes.any, /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.object,
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
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  tracks: PropTypes.arrayOf(
    PropTypes.any,
  ),
};

export default Editor;
