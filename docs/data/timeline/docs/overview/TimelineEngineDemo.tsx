import * as React from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import { Timeline, TimelineState} from '@stoked-ui/timeline';
import Controller from "@stoked-ui/editor/src/Controllers/Controller";
import AudioControl from "@stoked-ui/editor/src/Controllers/AudioController";
import AnimationControl from "@stoked-ui/editor/src/Controllers/AnimationController";
import VideoControl from "@stoked-ui/editor/src/Controllers/VideoController";
import ImageControl from "@stoked-ui/editor/src/Controllers/ImageController";

export const demoActions = [
  {
    name: 'video',
    start: 0,
    end: 20,
    controllerName: 'video',  // Use the new video effect
    src: '/static/video-editor/stock-loop.mp4',
    layer: 'background',
  },
  {
    name: 'write stuff',
    start: 9.5,
    end: 16,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/lottie1.json',
  },
  {
    name: 'doing things',
    start: 5,
    end: 9.5,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/lottie2.json',
  },
  {
    name: 'stolen cow',
    start: 0,
    end: 5,
    controllerName: 'animation',
    src: '/static/timeline/docs/overview/lottie3.json',
  },
  {
    name: 'music',
    start: 0,
    end: 20,
    controllerName: 'audio',
    src: '/static/timeline/docs/overview/funeral.m4a',
  },
];


const Controllers: Record<string, Controller> = {
  audio: AudioControl,
  animation: AnimationControl,
  video: VideoControl,
  image: ImageControl,
}

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
function Editor(inProps: any) {

  const timelineState = React.useRef<TimelineState>(null);
  const [scaleWidth, setScaleWidth] = React.useState(160);

  const setScaleWidthProxy = (val: number) => {
    setScaleWidth(val);
  };

  return (<Timeline
      controllers={Controllers}
      timelineState={timelineState}
      actionData={inProps.actionData}
      scaleWidth={scaleWidth}
      setScaleWidth={setScaleWidthProxy}
      viewSelector={`.MuiEditorView-root`}
      labels
    />)
}

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
