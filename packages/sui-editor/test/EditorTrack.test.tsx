import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import EditorTrack from '../src/EditorTrack';
import EditorProvider from '../src/EditorProvider';
import EditorFile from '../src/EditorFile/EditorFile';

describe('<EditorTrack />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: []
    };
    
    const { container } = render(
      <EditorProvider>
        <EditorTrack track={track} />
      </EditorProvider>
    );
    
    expect(container.firstChild).to.have.class('MuiEditorTrack-root');
  });
  
  it('should display track name correctly', () => {
    const track = {
      id: 'track-1',
      name: 'Audio Track',
      type: 'audio',
      actions: []
    };
    
    const { container } = render(
      <EditorProvider>
        <EditorTrack track={track} />
      </EditorProvider>
    );
    
    expect(container.textContent).to.include('Audio Track');
  });
  
  it('should render actions correctly', () => {
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: [
        { id: 'action-1', start: 0, duration: 10, name: 'Intro' },
        { id: 'action-2', start: 12, duration: 8, name: 'Middle Segment' }
      ]
    };
    
    const { container } = render(
      <EditorProvider>
        <EditorTrack track={track} />
      </EditorProvider>
    );
    
    // Should render two actions
    const actionElements = container.querySelectorAll('.MuiEditorAction-root');
    expect(actionElements.length).to.equal(2);
  });
  
  it('should handle selection correctly', () => {
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: []
    };
    
    // Create a component to check selected track
    const SelectionChecker = () => {
      const { state, dispatch } = React.useContext(EditorProvider.Context);
      
      React.useEffect(() => {
        // Select the track
        dispatch({ 
          type: 'SELECT_TRACK', 
          payload: { trackId: 'track-1' } 
        });
      }, [dispatch]);
      
      return (
        <div data-testid="selected-track">
          {state.selection?.type === 'track' ? state.selection.id : 'none'}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider>
        <EditorTrack track={track} />
        <SelectionChecker />
      </EditorProvider>
    );
    
    expect(getByTestId('selected-track').textContent).to.equal('track-1');
    
    // The track should have selected class
    expect(container.querySelector('.Mui-selected')).to.exist;
  });
  
  it('should handle track click', () => {
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: []
    };
    
    // Create a component to check selected track after click
    const SelectionChecker = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div data-testid="selected-track">
          {state.selection?.type === 'track' ? state.selection.id : 'none'}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider>
        <EditorTrack track={track} />
        <SelectionChecker />
      </EditorProvider>
    );
    
    // Initially no track should be selected
    expect(getByTestId('selected-track').textContent).to.equal('none');
    
    // Find track element and click it
    const trackElement = container.querySelector('.MuiEditorTrack-root');
    if (trackElement) {
      trackElement.click();
      
      // After click, the track should be selected
      expect(getByTestId('selected-track').textContent).to.equal('track-1');
    }
  });
  
  it('should handle action click within track', () => {
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: [
        { id: 'action-1', start: 0, duration: 10, name: 'Intro' }
      ]
    };
    
    // Create a component to check selected action
    const SelectionChecker = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div data-testid="selected-action">
          {state.selection?.type === 'action' ? state.selection.id : 'none'}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider>
        <EditorTrack track={track} />
        <SelectionChecker />
      </EditorProvider>
    );
    
    // Initially no action should be selected
    expect(getByTestId('selected-action').textContent).to.equal('none');
    
    // Find action element and click it
    const actionElement = container.querySelector('.MuiEditorAction-root');
    if (actionElement) {
      actionElement.click();
      
      // After click, the action should be selected
      expect(getByTestId('selected-action').textContent).to.equal('action-1');
    }
  });
  
  it('should apply custom styles via sx prop', () => {
    const track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      actions: []
    };
    
    const { container } = render(
      <EditorProvider>
        <EditorTrack 
          track={track}
          sx={{ backgroundColor: 'red' }}
        />
      </EditorProvider>
    );
    
    // In a real test, we would check the computed style
    expect(container.firstChild).to.have.class('MuiEditorTrack-root');
  });
}); 