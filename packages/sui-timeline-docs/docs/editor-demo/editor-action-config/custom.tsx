import React, { FC } from 'react';
import { TimelineAction, TimelineRow } from '@stoked-ui/timeline';

export const CustomRender0: FC<{ action: TimelineAction; row: TimelineRow }> =
  ({ action, row }) => {
    return (
      <div className={'effect0'}>
        <div className={`effect0-text`}>{`Play audio: ${(
          action.end - action.start
        ).toFixed(2)}s ${action.movable === false ? '（Not removable）' : ''} ${
          action.flexible === false ? '（Not scalable）' : ''
        }`}</div>
      </div>
    );
  };

export const CustomRender1: FC<{ action: TimelineAction; row: TimelineRow }> =
  ({ action, row }) => {
    return <div className={'effect1'}>
      <img src="/assets/flag.png"></img>
    </div>;
  };
