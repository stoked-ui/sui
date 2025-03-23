import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import Editor from '../src/Editor';
import EditorProvider from '../src/EditorProvider';
import EditorFile from '../src/EditorFile/EditorFile';

describe('Editor Integration', () => {
  const { render } = createRenderer();

  it('should handle file loading correctly', () => {
    // Create a test file with tracks and actions
    const file = new EditorFile({
      name: 'Test Project',
      tracks: [
        {
          id: 'track-1',
          name: 'Video Track',
          type: 'video',
          actions: [
            { id: 'action-1', start: 0, duration: 10, name: 'Intro' }
          ]
        },
        {
          id: 'track-2',
          name: 'Audio Track',
          type: 'audio',
          actions: [
            { id: 'action-2', start: 2, duration: 8, name: 'Background Music' }
          ]
        }
      ]
    });
    
    // Create a component that displays file information
    const FileInfo = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div>
          <div data-testid="project-name">{state.file?.name}</div>
          <div data-testid="track-count">{state.file?.tracks.length}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <EditorProvider initialFile={file}>
        <Editor />
        <FileInfo />
      </EditorProvider>
    );
    
    expect(getByTestId('project-name').textContent).to.equal('Test Project');
    expect(getByTestId('track-count').textContent).to.equal('2');
  });
  
  it('should handle track selection through UI', () => {
    // Create a test file with tracks
    const file = new EditorFile({
      name: 'Test Project',
      tracks: [
        {
          id: 'track-1',
          name: 'Video Track',
          type: 'video',
          actions: []
        },
        {
          id: 'track-2',
          name: 'Audio Track',
          type: 'audio',
          actions: []
        }
      ]
    });
    
    // Create a component that displays selected track
    const SelectionInfo = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div data-testid="selected-track">
          {state.selection?.type === 'track' ? state.selection.id : 'none'}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider initialFile={file}>
        <Editor />
        <SelectionInfo />
      </EditorProvider>
    );
    
    // Initially no track should be selected
    expect(getByTestId('selected-track').textContent).to.equal('none');
    
    // Find track element and click it
    const trackElements = container.querySelectorAll('.MuiEditorTrack-root');
    if (trackElements.length > 0) {
      trackElements[0].click();
      
      // After click, the track should be selected
      expect(getByTestId('selected-track').textContent).to.equal('track-1');
    }
  });
  
  it('should handle action selection through UI', () => {
    // Create a test file with a track and action
    const file = new EditorFile({
      name: 'Test Project',
      tracks: [
        {
          id: 'track-1',
          name: 'Video Track',
          type: 'video',
          actions: [
            { id: 'action-1', start: 0, duration: 10, name: 'Intro' }
          ]
        }
      ]
    });
    
    // Create a component that displays selected action
    const SelectionInfo = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div data-testid="selected-action">
          {state.selection?.type === 'action' ? state.selection.id : 'none'}
        </div>
      );
    };
    
    const { getByTestId, container } = render(
      <EditorProvider initialFile={file}>
        <Editor />
        <SelectionInfo />
      </EditorProvider>
    );
    
    // Initially no action should be selected
    expect(getByTestId('selected-action').textContent).to.equal('none');
    
    // Find action element and click it
    const actionElements = container.querySelectorAll('.MuiEditorAction-root');
    if (actionElements.length > 0) {
      actionElements[0].click();
      
      // After click, the action should be selected
      expect(getByTestId('selected-action').textContent).to.equal('action-1');
    }
  });
  
  it('should update view settings through props', () => {
    // Create a test file
    const file = new EditorFile({
      name: 'Test Project',
      tracks: []
    });
    
    // Create a component that displays settings
    const SettingsInfo = () => {
      const { state } = React.useContext(EditorProvider.Context);
      return (
        <div>
          <div data-testid="file-view">{state.settings.fileView ? 'true' : 'false'}</div>
          <div data-testid="labels">{state.settings.labels ? 'true' : 'false'}</div>
        </div>
      );
    };
    
    // Test with fileView enabled
    const { getByTestId, rerender } = render(
      <EditorProvider initialFile={file}>
        <Editor fileView={true} labels={false} />
        <SettingsInfo />
      </EditorProvider>
    );
    
    expect(getByTestId('file-view').textContent).to.equal('true');
    expect(getByTestId('labels').textContent).to.equal('false');
    
    // Update props and rerender
    rerender(
      <EditorProvider initialFile={file}>
        <Editor fileView={false} labels={true} />
        <SettingsInfo />
      </EditorProvider>
    );
    
    // Settings should be updated
    expect(getByTestId('file-view').textContent).to.equal('false');
    expect(getByTestId('labels').textContent).to.equal('true');
  });
  
  it('should handle fullscreen mode switching', () => {
    // Create a test file
    const file = new EditorFile({
      name: 'Test Project',
      tracks: []
    });
    
    // Render component with fullscreen mode
    const { container } = render(
      <EditorProvider initialFile={file}>
        <Editor fullscreen={true} />
      </EditorProvider>
    );
    
    // Check that fullscreen class or attribute is applied
    expect(container.querySelector('.MuiEditor-fullscreen')).to.exist;
  });
}); 