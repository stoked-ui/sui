import * as React from 'react';
import { styled } from '@mui/material/styles';
import { TimelineControl } from '@stoked-ui/timeline';
import { cloneDeep } from 'lodash';
import { mockData, mockEffect } from './mock';

const defaultEditorData = cloneDeep(mockData);

const TimelineList = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'auto',
  padding: '0 10px',
  borderRight: `1px solid ${theme.palette.divider}`,
  '& .timeline-list-item': {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .text': {
    fontSize: '16px',
  },
}));

const EditorRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '800px',
  backgroundColor: theme.palette.background.default,
  '& .timeline-list': {
    width: '150px',
    marginTop: '42px',
    height: '258px',
    flex: '0 1 auto',
    overflow: 'overlay',
    '&-item': {
      height: '32px',
      padding: '2px',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '& .text': {
        color: theme.palette.text.primary,
        height: '28px',
        width: '100%',
        paddingLeft: '10px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.grey.A100,
      },
    },
  },
  '.timeline-editor': {
    height: '300px',
    flex: '1 1 auto',
    '&-action': {
      height: '28px !important',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  },
}));

function TimelineEditorDemo() {
  const [tracks, setTracks] = React.useState(defaultEditorData);
  const domRef = React.useRef(null);
  const timelineState = React.useRef(null);
  /* return <Timeline tracks={defaultEditorData} />;
   */

  return (
    <EditorRoot className=" timeline-editor-example7 ">
      <TimelineList
        ref={domRef}
        style={{ overflow: 'overlay' }}
        onScroll={(e) => {
          const target = e.target;
          timelineState.current?.setScrollTop(target.scrollTop);
        }}
        className={'timeline-list'}
      >
        {tracks.map((track) => {
          return (
            <div className="timeline-list-item" key={track.id}>
              <div className="text"> {`track ${track.id}`} </div>
            </div>
          );
        })}
      </TimelineList>
      <TimelineControl
        sx={{
          height: '300px',
          flex: '1 1 auto',
          '&-action': {
            height: '28px !important',
            top: '50%',
            transform: 'translateY(-50%)',
          },
        }}
        onDoubleClickRow={(e, { track, time }) => {
          setTracks((previous) => {
            const rowIndex = previous.findIndex(
              (previousTrack) => previousTrack.id === track.id,
            );
            const newAction = {
              id: `action ${previous.length}`,
              start: time,
              end: time + 0.5,
              effectId: 'effect0',
            };
            previous[rowIndex] = {
              ...track,
              actions: [...track.actions, newAction],
            };
            return [...previous];
          });
        }}
        ref={timelineState}
        onChange={setTracks}
        tracks={tracks}
        actionTypes={mockEffect}
        onScroll={({ scrollTop }) => {
          if (domRef.current) {
            domRef.current.scrollTop = scrollTop;
          }
        }}
      />
    </EditorRoot>
  );
}

export default TimelineEditorDemo;
