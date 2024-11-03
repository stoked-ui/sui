import * as React from 'react';
import Timeline, {TimelineProvider, Controllers} from '@stoked-ui/timeline';
import {actions} from "../../../editor/docs/overview/CoreDemo";

export const demoActions = [
  {
    name: 'video',
    start: 0,
    end: 20,
    controllerName: 'video', // Use the new video effect
    src: '/static/editor/stock-loop.mp4',
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
export default function TimelineEngineDemo(inProps) {
  const timelineState = React.useRef(null);
  const [scaleWidth, setScaleWidth] = React.useState(160);

  const setScaleWidthProxy = (val) => {
    setScaleWidth(val);
  };

  return (
    <TimelineProvider actions={demoActions}>
      <Timeline
        controllers={Controllers}
        timelineState={timelineState}
        actionData={inProps.actionData}
        scaleWidth={scaleWidth}
        setScaleWidth={setScaleWidthProxy}
        viewSelector={`.MuiEditorView-root`}
        labels
      />
    </TimelineProvider>
  );
}
