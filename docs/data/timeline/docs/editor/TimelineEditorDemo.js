import {Timeline, TimelineState} from '@stoked-ui/timeline' ;
import {cloneDeep} from 'lodash' ;
import * as React from 'react' ;
import {mockData, mockEffect} from './mock' ;

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor = () => {
  const [data, setData] = React.useState(defaultEditorData);
  const domRef = React.useRef();
  const timelineState = React.useRef();
  return (
    <div className=" timeline-editor-example7 ">
      <div
        ref={domRef}
        style={{overflow: 'overlay'}}
        onScroll={(e) => {
          const target = e.target;
          timelineState.current.setScrollTop(target.scrollTop);
        }}
        className={'timeline-list'}
      >
        {data.map((item) => {
          return (
            <div className=" timeline-list-item " key={item.id}>
              <div className=" text "> {` row ${item.id} `} </div>
            </div>
          );
        })}
      </div>
      <Timeline
        onDoubleClickRow={(e, {row, time}) => {
          setData((pre) => {
            const rowIndex = pre.findIndex(item => item.id === row.id);
            const newAction = {
              id: ` action ${data.length++} `,
              start: time,
              end: time + 0.5,
              effectId: "effect0",
            }
            pre [rowIndex] = {...row, actions: row.actions.concat(newAction)};
            return [...pre];
          })
        }}
        ref={timelineState}
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        onScroll={({scrollTop}) => {
          domRef.current.scrollTop = scrollTop;
        }}
      />
    </div>
  );
};

export default TimelineEditor;
