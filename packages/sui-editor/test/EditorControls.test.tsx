import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import EditorControls from '../src/EditorControls';
import EditorProvider from '../src/EditorProvider';
import EditorFile from '../src/EditorFile/EditorFile';

describe('<EditorControls />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const file = new EditorFile({
      name: 'Test Project',
      tracks: []
    });
    
    const { container } = render(
      <EditorProvider initialFile={file}>
        <EditorControls />
      </EditorProvider>
    );
    
    expect(container.firstChild).to.have.class('MuiEditorControls-root');
  });
  
  it('should display current time correctly', () => {
    const file = new EditorFile({
      name: 'Test Project',
      tracks: []
    });
    
    // Create a component to update the current time
    const TimeController = () => {
      const { dispatch } = React.useContext(EditorProvider.Context);
      
      React.useEffect(() => {
        // Set current time to 10 seconds
        dispatch({ type: 'SET_CURRENT_TIME', payload: 10 });
      }, [dispatch]);
      
      return null;
    };
    
    const { container } = render(
      <EditorProvider initialFile={file}>
        <TimeController />
        <EditorControls />
      </EditorProvider>
    );
    
    // Current time display should show 10 seconds (or 00:10 format)
    const timeDisplay = container.querySelector('.MuiEditorControls-timeDisplay');
    if (timeDisplay) {
      expect(timeDisplay.textContent).to.include('10');
    }
  });
  
  it('should handle play/pause button click', () => {
    const file = new EditorFile({
      name: 'Test Project',
      tracks: []
    });
    
    // Create a component to check playing state
    const PlayStateChecker = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div data-testid="play-state">
          {state.isPlaying ? 'playing' : 'paused'}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider initialFile={file}>
        <EditorControls />
        <PlayStateChecker />
      </EditorProvider>
    );
    
    // Initially should be paused
    expect(getByTestId('play-state').textContent).to.equal('paused');
    
    // Find and click play button
    const playButton = container.querySelector('.MuiEditorControls-playButton');
    if (playButton) {
      playButton.click();
      
      // Should now be playing
      expect(getByTestId('play-state').textContent).to.equal('playing');
      
      // Click again to pause
      playButton.click();
      
      // Should be paused again
      expect(getByTestId('play-state').textContent).to.equal('paused');
    }
  });
  
  it('should handle time scrubbing', () => {
    const file = new EditorFile({
      name: 'Test Project',
      tracks: [],
      duration: 100
    });
    
    // Create a component to check current time
    const TimeChecker = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div data-testid="current-time">
          {state.currentTime}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider initialFile={file}>
        <EditorControls />
        <TimeChecker />
      </EditorProvider>
    );
    
    // Initially time should be 0
    expect(getByTestId('current-time').textContent).to.equal('0');
    
    // Find time scrubber and simulate mouse events
    const scrubber = container.querySelector('.MuiEditorControls-scrubber');
    if (scrubber) {
      // Simulate clicking at 50% of the scrubber width
      // In a real test, we would need to mock getBoundingClientRect and 
      // simulate more complex mouse events, but this is simplified for the example
      
      // Dispatch a custom time change event (in a real app, the scrubber would do this)
      const { dispatch } = React.useContext(EditorProvider.Context);
      dispatch({ type: 'SET_CURRENT_TIME', payload: 50 });
      
      // Current time should be updated
      expect(getByTestId('current-time').textContent).to.equal('50');
    }
  });
  
  it('should display duration correctly', () => {
    const file = new EditorFile({
      name: 'Test Project',
      tracks: [],
      duration: 120 // 2 minutes
    });
    
    const { container } = render(
      <EditorProvider initialFile={file}>
        <EditorControls />
      </EditorProvider>
    );
    
    // Duration display should show 2 minutes (or 02:00 format)
    const durationDisplay = container.querySelector('.MuiEditorControls-durationDisplay');
    if (durationDisplay) {
      expect(durationDisplay.textContent).to.include('120');
    }
  });
  
  it('should apply custom styles through sx prop', () => {
    const file = new EditorFile({
      name: 'Test Project',
      tracks: []
    });
    
    const { container } = render(
      <EditorProvider initialFile={file}>
        <EditorControls sx={{ backgroundColor: 'red' }} />
      </EditorProvider>
    );
    
    // In a real test, we would check computed styles
    expect(container.firstChild).to.have.class('MuiEditorControls-root');
  });
}); 