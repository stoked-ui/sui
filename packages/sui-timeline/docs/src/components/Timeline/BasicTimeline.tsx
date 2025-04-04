import * as React from 'react';
import { Timeline } from '../../../../src';
import { TimelineFile } from '../../../../src/TimelineFile';

/**
 * BasicTimeline Component
 *
 * A basic implementation of the Timeline component.
 *
 * @description Displays a timeline with sample data.
 */

export default function BasicTimeline() {
  const [file, setFile] = React.useState<TimelineFile | null>(null);

  /**
   * useEffect Hook
   *
   * Creates a timeline file with sample data on mount.
   *
   * @description Initializes the timeline file state and sets it to the created timeline object.
   */
  React.useEffect(() => {
    const timelineFile = new TimelineFile({
      tracks: [
        {
          id: 'track-1',
          name: 'Track 1',
          actions: [
            { id: 'action-1', start: 0, duration: 10, name: 'Action 1' },
            { id: 'action-2', start: 15, duration: 5, name: 'Action 2' }
          ]
        },
        {
          id: 'track-2',
          name: 'Track 2',
          actions: [
            { id: 'action-3', start: 5, duration: 8, name: 'Action 3' }
          ]
        }
      ]
    });

    setFile(timelineFile);
  }, []);

  return (
    <Timeline
      file={file}
      labels={true}
    />
  );
}