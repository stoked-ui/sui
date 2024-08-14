import { Timeline } from '@stoked-ui/timeline';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor3 = () => {
  const [data, setData] = useState(defaultEditorData);
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <div className="timeline-editor-example9">
      <Switch
        checkedChildren="Turn on autoscroll"
        unCheckedChildren="Disable autoscroll"
        checked={autoScroll}
        onChange={(e) => setAutoScroll(e)}
        style={{ marginBottom: 20 }}
      />
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        autoScroll={autoScroll}
      />
    </div>
  );
};

export default TimelineEditor3;
