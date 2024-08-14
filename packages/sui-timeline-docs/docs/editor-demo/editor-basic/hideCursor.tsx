import { Timeline } from '@stoked-ui/timeline';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor7 = () => {
  const [data, setData] = useState(defaultEditorData);
  const [showCursor, setShowCursor] = useState(false);

  return (
    <div className="timeline-editor-example0">
      <Switch
        checkedChildren="Open cursor"
        unCheckedChildren="Hide cursor"
        checked={showCursor}
        onChange={e => setShowCursor(e)}
        style={{marginBottom: 20}}
      />
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={!showCursor}
      />
    </div>
  );
};

export default TimelineEditor7;
