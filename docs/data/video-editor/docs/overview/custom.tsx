import * as React from 'react';
import { TimelineAction, TimelineTrack } from "@stoked-ui/timeline";

export const CustomRender0: React.FC<{ action: TimelineAction; row: TimelineTrack }> = ({ action, row }) => {
  return (
    <div className={'effect0'}>
      <div className={`effect0-text`}>{`Play audio: ${action.data.name}`}</div>
    </div>
  );
};

export const CustomRender1: React.FC<{ action: TimelineAction; row: TimelineTrack }> = ({ action, row }) => {
  return (
    <div className={'effect1'}>
      <div className={`effect1-text`}>{`Play animation: ${action.data.name}`}</div>
    </div>
  );
};
