import * as React from 'react';
import PropTypes from 'prop-types';
import useForkRef from '@mui/utils/useForkRef';
import { FileBase, FileExplorer } from '@stoked-ui/file-explorer';
import { useSlotProps } from '@mui/base/utils';
import composeClasses from '@mui/utils/composeClasses';
import Stack from '@mui/material/Stack';
import { Timeline, TimelineEngine, TimelineState } from '@stoked-ui/timeline';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { useEditor } from '../internals/useEditor';
import { EditorProps } from './Editor.types';
import { EditorPluginSignatures, VIDEO_EDITOR_PLUGINS } from './Editor.plugins';
import { EditorControls } from '../EditorControls';
import { EditorView } from '../EditorView';
import { getEditorUtilityClass } from './editorClasses';
import { EditorLabels } from '../EditorLabels';
import { buildTracks } from '../internals/utils/TrackBuilder';

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
  const combinedEditorRef = useForkRef(ref, editorRef);
  const processedTracks = buildTracks({
    tracks: props.tracks,
    actions: props.actions,
    actionData: props.actionData,
  });
  const [tracks, setTracks] = React.useState(processedTracks);

  const {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getBottomLeftProps,
    getBottomRightProps,
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS,
    rootRef: ref,
    props: props,
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
  const engine = React.useRef<TimelineEngine>(new TimelineEngine());
  const [scaleWidth, setScaleWidth] = React.useState(160);
  const viewerRef = React.useRef<HTMLDivElement>(null);

  const setScaleWidthProxy = (val: number) => {
    setScaleWidth(val);
  };

  console.log('generatedTracks', timelineProps.tracks);
  React.useEffect(() => {
    if (!editorRef?.current || !engine.current) {
      return;
    }

    editorRef.current?.addEventListener('keydown', (event: any) => {
      if (event.target) {
        const actionTracks = engine.current.getSelectedActions();
        if (actionTracks?.length && event.key === 'Backspace') {
          setTracks((previous) => {
            const deletedActionIds = actionTracks.map((at) => at.action.id);
            previous.forEach((track) => {
              track.actions = track.actions.filter(
                (action) => deletedActionIds.indexOf(action.id) === -1,
              );
            });
            return [...previous];
          });
        }
      }
    });
  }, [editorRef]);

  const [startIt, setStartIt] = React.useState(false);
  React.useEffect(() => {
    if (!startIt && viewerRef.current && engine.current) {
      engine.current.viewer = viewerRef.current;
      setStartIt(true);
    }
  }, [viewerRef.current]);

  return (
    <Root {...rootProps} sx={sx}>
      <EditorViewSlot {...editorViewProps} ref={viewerRef} engine={engine} />
      <ControlsSlot
        {...videoControlsProps}
        timelineState={timelineState}
        scaleWidth={scaleWidth}
        setScaleWidth={setScaleWidthProxy}
      />
      {startIt && (
        <TimelineSlot
          {...timelineProps}
          tracks={tracks}
          setTracks={setTracks}
          timelineState={timelineState}
          scaleWidth={scaleWidth}
          setScaleWidth={setScaleWidthProxy}
          viewSelector={`.MuiEditorView-root`}
          slots={{ labels: EditorLabels }}
          labels
          engine={engine}
        />
      )}

      <Stack direction="row" spacing={2}>
        <BottomLeft {...bottomLeftProps} />
        <BottomRight {...bottomRightProps} />
      </Stack>
    </Root>
  );
});

Editor.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  actionData: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        src: PropTypes.string.isRequired,
      }),
      disable: PropTypes.bool,
      effectId: PropTypes.string.isRequired,
      end: PropTypes.number.isRequired,
      flexible: PropTypes.bool,
      id: PropTypes.string,
      movable: PropTypes.bool,
      name: PropTypes.string.isRequired,
      selected: PropTypes.bool,
      start: PropTypes.number.isRequired,
    }),
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.shape({
        src: PropTypes.string.isRequired,
        style: PropTypes.object,
      }),
      disable: PropTypes.bool,
      effectId: PropTypes.string.isRequired,
      end: PropTypes.number.isRequired,
      flexible: PropTypes.bool,
      id: PropTypes.string.isRequired,
      maxEnd: PropTypes.number,
      minStart: PropTypes.number,
      movable: PropTypes.bool,
      name: PropTypes.string,
      onKeyDown: PropTypes.func,
      selected: PropTypes.bool,
      start: PropTypes.number.isRequired,
    }),
  ),
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with `useEditorApiRef()`.
   */
  apiRef: PropTypes.shape({
    current: PropTypes.object,
  }),
  /**
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
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          data: PropTypes.shape({
            src: PropTypes.string.isRequired,
            style: PropTypes.object,
          }),
          disable: PropTypes.bool,
          effectId: PropTypes.string.isRequired,
          end: PropTypes.number.isRequired,
          flexible: PropTypes.bool,
          id: PropTypes.string.isRequired,
          maxEnd: PropTypes.number,
          minStart: PropTypes.number,
          movable: PropTypes.bool,
          name: PropTypes.string,
          onKeyDown: PropTypes.func,
          selected: PropTypes.bool,
          start: PropTypes.number.isRequired,
        }),
      ).isRequired,
      classNames: PropTypes.arrayOf(PropTypes.string),
      hidden: PropTypes.bool,
      id: PropTypes.string.isRequired,
      lock: PropTypes.bool,
      name: PropTypes.string.isRequired,
      rowHeight: PropTypes.number,
      selected: PropTypes.bool,
    }),
  ),
} as any;

export { Editor };
