import { Timeline } from '@stoked-ui/timeline';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor6 = () => {
  const [data, setData] = useState(defaultEditorData);
  const [allow, setAllow] = useState(true);

  return (
    <div className="timeline-editor-example0">
      <Switch
        checkedChildren="Enable editing"
        unCheckedChildren="Disable editing"
        checked={allow}
        onChange={(e) => setAllow(e)}
        style={{ marginBottom: 20 }}
      />
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        disableDrag={!allow}
      />
    </div>
  );
};

export default TimelineEditor6;
