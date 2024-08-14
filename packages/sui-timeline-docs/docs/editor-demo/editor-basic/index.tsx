import { Timeline } from '@stoked-ui/timeline';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor8 = () => {
  const [data, setData] = useState(defaultEditorData);

  return (
    <div className="timeline-editor-example0">
      <Timeline
        onChange={setData}
        editorData={data}
        effects={mockEffect}
        hideCursor={false}
        autoScroll={true}
      />
    </div>
  );
};

export default TimelineEditor8;
