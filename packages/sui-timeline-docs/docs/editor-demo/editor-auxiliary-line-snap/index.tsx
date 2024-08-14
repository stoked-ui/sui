import { Timeline } from '@stoked-ui/timeline';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor4 = () => {
  const [data, setData] = useState(defaultEditorData);
  const [dragLine, setDragLine] = useState(true);

  return (
    <div className="timeline-editor-example4">
      <Switch
        style={{ marginBottom: 12 }}
        checked={dragLine}
        checkedChildren="Turn on auxiliary lines"
        unCheckedChildren="Disable guides"
        onChange={setDragLine}
      />
      <Timeline
        scale={5}
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        dragLine={dragLine}
      />
    </div>
  );
};

export default TimelineEditor4;
