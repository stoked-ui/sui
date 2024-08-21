import * as React from 'react';
import PropTypes from 'prop-types';
import { Timeline, TimelineEngine, TimelineState } from '@stoked-ui/timeline';
import { FileBase, FileExplorer } from '@stoked-ui/file-explorer';
import { useSlotProps } from '@mui/base/utils';
import composeClasses from '@mui/utils/composeClasses';
import Stack from '@mui/material/Stack';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { useEditor } from '../internals/useEditor';
import { EditorProps } from './Editor.types';
import { EditorPluginSignatures, VIDEO_EDITOR_PLUGINS } from './Editor.plugins';
import { EditorControls } from '../EditorControls';
import { EditorView } from '../EditorView';
import { getEditorUtilityClass } from './editorClasses';
import { EditorLabels } from "../EditorLabels";
import { MuiCancellableEvent } from '../internals/models/MuiCancellableEvent';
import useForkRef from '@mui/utils/useForkRef';

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
  name: "MuiEditor",
  slot: "root"
})(({ theme, sx }) => ({
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
export const Editor = React.forwardRef(function Editor<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const props = useThemeProps({ props: inProps, name: 'MuiEditor' });
  const editorRef = React.useRef<HTMLDivElement>(null);
  const combinedEditorRef = useForkRef(ref , editorRef);

  const {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getBottomLeftProps,
    getBottomRightProps,
    contextValue,
    instance,
  } = useEditor<EditorPluginSignatures, EditorProps<R, Multiple>>({
    plugins: VIDEO_EDITOR_PLUGINS,
    rootRef: combinedEditorRef,
    props: inProps,
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
    ownerState: props,
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

  const setScaleWidthProxy = (val: number) => {
    setScaleWidth(val);
  }

  React.useEffect(() => {
    if (!editorRef?.current || !engine.current) {
      return;
    }
    editorRef.current?.addEventListener('keydown', function (event: any) {
      console.log('event', event)
      if (event.target) {
        const selectedActions = event.target.querySelectorAll('timeline-editor-edit-track-selected');

        const actionTrack = engine.current.getAction(event.currentTarget.id);
        instance.handleItemKeyDown(event, 'action', actionTrack);
      }

    });
  }, [editorRef]);

  const [listening, setListening] = React.useState(false);
  const useMutationObserver = (
    mutationRef,
    callback,
    options:  MutationObserverInit
  ) => {
    React.useEffect(() => {
      if (mutationRef.current ) {
        const parentCallback = (mutationList, observerRef) => {
          //console.log('mutationList', mutationList, observerRef);
          mutationList.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              console.log('added node', node )
            })
          })
          /*if (mutationRef.current?.parentNode?.parentNode) {
            callback(mutationRef.current.parentNode.parentNode, observerRef);
          }*/
        }
        const observer = new MutationObserver(parentCallback);
        observer.observe(mutationRef.current, options);
        setListening(true);
      }
    }, [mutationRef.current]);
  };

  const setActionKeyDown = (root, observer) => {
    const actionElements = root.querySelectorAll('[role=action]');
    if (actionElements) {
      actionElements.forEach((actionElement) => {
        actionElement.onKeyDown = (event: any) => {
          const actionTrack = engine.current.getAction(actionElement.id);
          instance.handleItemKeyDown(event, 'action', actionTrack);
        }
      })
    }
  }

  useMutationObserver(editorRef, setActionKeyDown, { childList: true, subtree: true });
  const middleOut = () => (
    <React.Fragment>
      <EditorViewSlot {...editorViewProps} />
      <ControlsSlot {...videoControlsProps} timelineState={timelineState} scaleWidth={scaleWidth} setScaleWidth={setScaleWidthProxy} />
      <TimelineSlot {...timelineProps} timelineState={timelineState} scaleWidth={scaleWidth}  setScaleWidth={setScaleWidthProxy} viewSelector={`.MuiEditorView-root`} slots={{ labels: EditorLabels }}/>
      <Stack direction="row" spacing={2}>
        <BottomLeft {...bottomLeftProps} />
        <BottomRight {...bottomRightProps} />
      </Stack>
    </React.Fragment>
  );
  return (
    <Root {...rootProps}>
      {listening &&  middleOut()}
    </Root>
  );
});

Editor.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The ref object that allows Editor View manipulation. Can be instantiated with `useEditorApiRef()`.
   */
  apiRef: PropTypes.shape({
    current: PropTypes.shape({
      selectItem: PropTypes.func.isRequired,
    }),
  }),
  /**
   * If `true`, the fileExplorer view renders a checkbox at the left of its label that allows selecting it.
   * @default false
   */
  checkboxSelection: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * Selected item ids. (Uncontrolled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   * @default []
   */
  defaultSelectedItems: PropTypes.any,
  /**
   * If `true` selection is disabled.
   * @default false
   */
  disableSelection: PropTypes.bool,
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures: PropTypes.object,
  /**
   * If `true`, `ctrl` and `shift` will trigger multiselect.
   * @default false
   */
  multiSelect: PropTypes.bool,
  /**
   * Callback fired when a fileExplorer item is selected or deselected.
   * @param {React.SyntheticEvent} event The event source of the callback.
   * @param {array} itemId The itemId of the modified item.
   * @param {array} isSelected `true` if the item has just been selected, `false` if it has just been deselected.
   */
  onItemSelectionToggle: PropTypes.func,
  /**
   * Callback fired when fileExplorer items are selected/deselected.
   * @param {React.SyntheticEvent} event The event source of the callback
   * @param {string[] | string} itemIds The ids of the selected items.
   * When `multiSelect` is `true`, this is an array of strings; when false (default) a string.
   */
  onSelectedItemsChange: PropTypes.func,
  /**
   * Selected item ids. (Controlled)
   * When `multiSelect` is true this takes an array of strings; when false (default) a string.
   */
  selectedItems: PropTypes.any,
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
} as any;
