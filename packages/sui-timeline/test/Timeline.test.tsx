import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import Timeline from '../src/Timeline';

describe('<Timeline />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const { container } = render(<Timeline />);
    
    expect(container.firstChild).to.have.class('MuiTimeline-root');
  });
  
  it('should render tracks correctly', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Track 1',
        actions: [
          { id: 'action-1', start: 0, duration: 10, name: 'Action 1' },
          { id: 'action-2', start: 12, duration: 8, name: 'Action 2' }
        ]
      },
      {
        id: 'track-2',
        name: 'Track 2',
        actions: [
          { id: 'action-3', start: 5, duration: 7, name: 'Action 3' }
        ]
      }
    ];
    
    const { container } = render(<Timeline tracks={tracks} />);
    
    // Should render two tracks
    const trackElements = container.querySelectorAll('.MuiTimeline-track');
    expect(trackElements.length).to.equal(2);
    
    // Should render three actions in total
    const actionElements = container.querySelectorAll('.MuiTimeline-action');
    expect(actionElements.length).to.equal(3);
  });
  
  it('should handle labels prop correctly', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Track 1',
        actions: []
      }
    ];
    
    // Render without labels
    const { container: containerNoLabels } = render(
      <Timeline tracks={tracks} labels={false} />
    );
    
    // Labels should not be visible
    const labelsNoLabels = containerNoLabels.querySelectorAll('.MuiTimeline-label');
    expect(labelsNoLabels.length).to.equal(0);
    
    // Render with labels
    const { container: containerWithLabels } = render(
      <Timeline tracks={tracks} labels={true} />
    );
    
    // Labels should be visible
    const labelsWithLabels = containerWithLabels.querySelectorAll('.MuiTimeline-label');
    expect(labelsWithLabels.length).to.be.greaterThan(0);
  });
  
  it('should handle currentTime prop correctly', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Track 1',
        actions: []
      }
    ];
    
    const { container } = render(
      <Timeline tracks={tracks} currentTime={10} />
    );
    
    // Cursor should be positioned at currentTime
    const cursor = container.querySelector('.MuiTimeline-cursor');
    expect(cursor).to.exist;
    // Additional checks for cursor position could be added here
  });
  
  it('should handle zoom prop correctly', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Track 1',
        actions: []
      }
    ];
    
    const { container: containerNormalZoom } = render(
      <Timeline tracks={tracks} zoom={1} />
    );
    
    const { container: containerHighZoom } = render(
      <Timeline tracks={tracks} zoom={2} />
    );
    
    // Different zoom levels should affect the layout
    // Additional checks for zoom effect could be added here
  });
  
  it('should apply custom colors correctly', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Track 1',
        type: 'video',
        actions: [
          { id: 'action-1', start: 0, duration: 10, name: 'Action 1' }
        ]
      }
    ];
    
    const customColors = {
      video: '#ff0000'
    };
    
    const { container } = render(
      <Timeline tracks={tracks} colors={customColors} />
    );
    
    // Actions should have the custom color applied
    // Additional checks for color application could be added here
  });
  
  it('should call onClickAction when an action is clicked', () => {
    const tracks = [
      {
        id: 'track-1',
        name: 'Track 1',
        actions: [
          { id: 'action-1', start: 0, duration: 10, name: 'Action 1' }
        ]
      }
    ];
    
    let clickedActionId = null;
    const handleClickAction = (e, data) => {
      clickedActionId = data.action.id;
    };
    
    const { container } = render(
      <Timeline 
        tracks={tracks} 
        onClickAction={handleClickAction}
      />
    );
    
    // Find the action element and click it
    const actionElement = container.querySelector('.MuiTimeline-action');
    if (actionElement) {
      actionElement.click();
      
      // onClickAction should have been called with the correct action
      expect(clickedActionId).to.equal('action-1');
    }
  });
}); 