import * as React from 'react';
import PropTypes from 'prop-types';
import { Timeline } from '@stoked-ui/timeline';
import { FileBase, FileExplorer } from '@stoked-ui/file-explorer';
import { useSlotProps } from '@mui/base/utils';
import composeClasses from '@mui/utils/composeClasses';
import Stack from '@mui/material/Stack';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { useVideoEditor } from '../internals/useVideoEditor';
import { VideoEditorProps } from './VideoEditor.types';
import { VideoEditorPluginSignatures, VIDEO_EDITOR_PLUGINS } from './VideoEditor.plugins';
import { VideoEditorControls } from '../VideoEditorControls';
import { ViewSpace } from '../ViewSpace';
import { getVideoEditorUtilityClass } from './videoEditorClasses';

const useThemeProps = createUseThemeProps('MuiVideoEditor');

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: VideoEditorProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    viewSpace: ['viewSpace'],
    videoControls: ['videoControls'],
    timeline: ['timeline'],
    bottomLeft: ['bottomLeft'],
    bottomRight: ['bottomRight'],
  };

  return composeClasses(slots, getVideoEditorUtilityClass, classes);
};

const VideoEditorRoot = styled('div')(({ theme, sx }) => ({
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
  overflow: 'hidden',
}));

/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/video-editor/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/video-editor/api/)
 */
export const VideoEditor = React.forwardRef(function VideoEditor<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>(inProps: VideoEditorProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const props = useThemeProps({ props: inProps, name: 'MuiVideoEditor' });
  console.log('inProps', inProps)

  const {
    getRootProps,
    getViewSpaceProps,
    getControlsProps,
    getTimelineProps,
    getBottomLeftProps,
    getBottomRightProps,
    contextValue,
    instance,
  } = useVideoEditor<VideoEditorPluginSignatures, typeof props>({
    plugins: VIDEO_EDITOR_PLUGINS,
    rootRef: ref,
    props,
  });

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? VideoEditorRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    getSlotProps: getRootProps,
    ownerState: props,
  });

  const ViewSpaceSlot = slots?.viewSpace ?? ViewSpace;
  const viewSpaceProps = useSlotProps({
    elementType: ViewSpaceSlot,
    externalSlotProps: slotProps?.viewSpace,
    className: classes.viewSpace,
    getSlotProps: getViewSpaceProps,
    ownerState: props,
  });

  const ControlsSlot = slots?.videoControls ?? VideoEditorControls;
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

  return (
    <Root className="timeline-editor-engine" sx={{...inProps.sx}}>
      <ViewSpaceSlot {...viewSpaceProps} />
      <ControlsSlot {...videoControlsProps} />
      <TimelineSlot {...timelineProps} />
      <Stack direction="row" spacing={2}>
        <BottomLeft {...bottomLeftProps} />
        <BottomRight {...bottomRightProps} />
      </Stack>
    </Root>
  );
});

VideoEditor.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The ref object that allows VideoEditor View manipulation. Can be instantiated with `useVideoEditorApiRef()`.
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
