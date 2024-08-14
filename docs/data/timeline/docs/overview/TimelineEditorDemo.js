import { styled } from '@mui/material/styles';
import {shouldForwardProp} from "@mui/system";
import { Timeline, TimelineAction, TimelineRow, TimelineState, TimelinePlayer } from '@stoked-ui/timeline';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { CustomRender0, CustomRender1 } from './custom';
// import './index.less';
import { CustomTimelineAction, CusTomTimelineRow, mockData, mockEffect, scale, scaleWidth, startLeft } from './mock';

const defaultEditorData = cloneDeep(mockData);

const getActionRenderer = (action, row) => {
  if (action.effectId === 'effect0') {
    return <CustomRender0 action={action} row={row} />;
  }
  // else if (action.effectId === 'effect1') {
  return <CustomRender1 action={action} row={row} />;
}

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '& .player-panel': {
    width: '100%',
    height: '300px',
    position: 'relative',

    '& .lottie-ani': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    }
  },
  overflow: 'hidden',
}));

export default function TimelineEditorDemo() {
  const [data, setData] = React.useState(defaultEditorData);
  const timelineState = React.useRef();
  const playerPanel = React.useRef();

  return (
    <Root className="timeline-editor-engine">
      <div className="player-panel" id="player-ground-1" ref={playerPanel}/>
      <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay scale={scale} scaleWidth={scaleWidth} startLeft={startLeft} />
      <Timeline
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        autoScroll
        ref={timelineState}
        editorData={data}
        effects={mockEffect}
        onChange={(dataRow) => {
          setData(dataRow);
        }}
        getActionRender={getActionRenderer}
      />
    </Root>
  );
};

