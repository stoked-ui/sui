import * as React from 'react';
import PropTypes from 'prop-types';
import {FileBase, FileExplorer} from '@stoked-ui/file-explorer';
import {useSlotProps} from '@mui/base/utils';
import composeClasses from '@mui/utils/composeClasses';
import Stack from '@mui/material/Stack';
import {Timeline, type TimelineState} from '@stoked-ui/timeline';
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {useEditor} from '../internals/useEditor';
import {EditorProps} from './Editor.types';
import {EditorPluginSignatures, VIDEO_EDITOR_PLUGINS} from './Editor.plugins';
import {EditorControls} from '../EditorControls';
import {EditorView} from '../EditorView';
import {getEditorUtilityClass} from './editorClasses';
import {EditorLabels} from '../EditorLabels';
import Engine from "../Engine/Engine";
import Controllers from "../Controllers";

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
    bottomLeft: ['bottomLeft'],
    bottomRight: ['bottomRight'],
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
  const editorRef = React.useRef<HTMLDivElement>(null);
  const {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getBottomLeftProps,
    getBottomRightProps,
    id,
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
    ownerState: props,
  });

  const ControlsSlot = slots?.videoControls ?? EditorControls;
  const videoControlsProps = useSlotProps({
    elementType: ControlsSlot,
    externalSlotProps: slotProps?.videoControls,
    className: classes.videoControls,
    getSlotProps: getControlsProps,
    ownerState: props,
  });

  const TimelineSlot = slots?.timeline ?? Timeline;
  const timelineProps = useSlotProps({
    elementType: TimelineSlot,
    externalSlotProps: slotProps?.timeline,
    className: classes.timeline,
    getSlotProps: getTimelineProps,
    ownerState: inProps,
  });

  const BottomLeft = slots?.bottomLeft ?? FileExplorer;
  const bottomLeftProps = useSlotProps({
    elementType: BottomLeft,
    externalSlotProps: slotProps?.bottomLeft,
    className: classes.bottomLeft,
    getSlotProps: getBottomLeftProps,
    ownerState: props as any,
  });

  const BottomRight = slots?.bottomRight ?? FileExplorer;
  const bottomRightProps = useSlotProps({
    elementType: BottomRight,
    externalSlotProps: slotProps?.bottomRight,
    className: classes.bottomRight,
    getSlotProps: getBottomRightProps,
    ownerState: props as any,
  });
  const timelineState = React.useRef<TimelineState>(null);
  const engineRef = React.useRef<Engine>(new Engine({id, controllers: Controllers}));
  const [scaleWidth, setScaleWidth] = React.useState(160);
  const viewerRef = React.useRef<HTMLDivElement>(null);

  const setScaleWidthProxy = (val: number) => {
    setScaleWidth(val);
  };

  /* React.useEffect(() => {
    if (!editorRef?.current || !engine) {
      return;
    }

    editorRef.current?.addEventListener('keydown', (event: any) => {
      if (event.target) {
        const actionTracks = engine.getSelectedActions();
        if (actionTracks?.length && event.key === 'Backspace' && timelineState.current) {
          const updatedTracks = [...timelineState.current.tracks];
          const deletedActionIds = actionTracks.map((at) => at.action.id);
          updatedTracks.forEach((updateTrack) => {
            updateTrack = { ...updateTrack };
            updateTrack.actions = [
              ...updateTrack.actions.filter((action) => deletedActionIds.indexOf(action.id) === -1),
            ];
          });
          engine.tracks = updatedTracks
        }
      }
    });
  }, [editorRef]); */


  const [startIt, setStartIt] = React.useState(false);
  React.useEffect(() => {
    if (!startIt && viewerRef.current && engineRef.current) {
      engineRef.current.viewer = viewerRef.current;
      setStartIt(true);
    }
  }, [viewerRef.current]);

  return (<Root role={'editor'} {...rootProps} >
      <EditorViewSlot {...editorViewProps} ref={viewerRef} engineRef={engineRef}/>
      {startIt &&
       <ControlsSlot
          role={'controls'}
          {...videoControlsProps}
          engineRef={engineRef}
          scaleWidth={scaleWidth}
          setScaleWidth={setScaleWidthProxy}
        />
      }
      {startIt &&
        <TimelineSlot
          role={'timeline'}
          {...timelineProps}
          controllers={Controllers}
          timelineState={timelineState}
          actionData={inProps.actionData}
          scaleWidth={scaleWidth}
          onKeyDown={instance.onKeyDown}
          setScaleWidth={setScaleWidthProxy}
          viewSelector={`.MuiEditorView-root`}
          slots={{labels: EditorLabels}}
          labels
          engineRef={engineRef}
        />
      }
      <Stack direction="row" spacing={2}>
        <BottomLeft role={'explorer-left'} {...bottomLeftProps} />
        <BottomRight role={'explorer-right'} {...bottomRightProps} />
      </Stack>
    </Root>);
});

Editor.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  actionData: PropTypes.any,
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

export { Editor };
