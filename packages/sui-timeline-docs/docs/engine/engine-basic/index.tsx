import { Timeline, TimelineState } from '@stoked-ui/timeline';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { CustomRender0, CustomRender1 } from './custom';
import './index.less';
import { CustomTimelineAction, CusTomTimelineRow, mockData, mockEffect, scale, scaleWidth, startLeft } from './mock';
import TimelinePlayer from './player';

const defaultEditorData = cloneDeep(mockData);

const getActionRenderer = (action, row) => {
  if (action.effectId === 'effect0') {
    return <CustomRender0 action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
  }
  // else if (action.effectId === 'effect1') {
  return <CustomRender1 action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
}

export default function TimelineEditorF() {
  const [data, setData] = React.useState(defaultEditorData);
  const timelineState = React.useRef<TimelineState>();
  const playerPanel = React.useRef<HTMLDivElement>();
  const autoScrollWhenPlay = React.useRef<boolean>(true);

  return (
    <div className="timeline-editor-engine">
      <div className="player-config">
        <Switch
          checkedChildren="ENABLE AUTOMATIC SCROLLING AT RUNTIME"
          unCheckedChildren="DISABLE AUTOMATIC SCROLLING AT RUNTIME"
          defaultChecked={autoScrollWhenPlay.current}
          onChange={(e) => (autoScrollWhenPlay.current = e)}
          style={{ marginBottom: 20 }}
        />
      </div>
      <div className="player-panel" id="player-ground-1" ref={playerPanel}/>
      <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay />
      <Timeline
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        autoScroll
        ref={timelineState}
        editorData={data}
        effects={mockEffect}
        onChange={(dataRow) => {
          setData(dataRow as CusTomTimelineRow[]);
        }}
        getActionRender={getActionRenderer}
      />
    </div>
  );
};

