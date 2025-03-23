import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { EditorProvider, useEditorContext } from '../src/EditorProvider';
import EditorFile from '../src/EditorFile/EditorFile';

describe('<EditorProvider />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const { container } = render(
      <EditorProvider>
        <div>Child Component</div>
      </EditorProvider>
    );
    
    expect(container.innerHTML).to.include('Child Component');
  });
  
  it('should provide editor context to child components', () => {
    // Create a component that consumes the editor context
    const ContextConsumer = () => {
      const { state } = useEditorContext();
      return <div data-testid="context-value">{state ? 'Context available' : 'No context'}</div>;
    };
    
    const { getByTestId } = render(
      <EditorProvider>
        <ContextConsumer />
      </EditorProvider>
    );
    
    expect(getByTestId('context-value').textContent).to.equal('Context available');
  });
  
  it('should initialize with default settings', () => {
    // Create a component that displays settings from context
    const SettingsDisplay = () => {
      const { state } = useEditorContext();
      const { settings } = state;
      return (
        <div>
          <div data-testid="file-view">{settings.fileView ? 'true' : 'false'}</div>
          <div data-testid="labels">{settings.labels ? 'true' : 'false'}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <EditorProvider>
        <SettingsDisplay />
      </EditorProvider>
    );
    
    // Default settings should be initialized
    expect(getByTestId('file-view').textContent).to.equal('false');
    expect(getByTestId('labels').textContent).to.equal('false');
  });
  
  it('should initialize with provided file', () => {
    // Create a component that displays file information from context
    const FileDisplay = () => {
      const { state } = useEditorContext();
      const { file } = state;
      return (
        <div>
          <div data-testid="has-file">{file ? 'true' : 'false'}</div>
          <div data-testid="track-count">{file?.tracks?.length || 0}</div>
        </div>
      );
    };
    
    // Create a test file
    const testFile = new EditorFile({
      tracks: [
        {
          id: 'track-1',
          name: 'Video Track',
          type: 'video',
          actions: []
        }
      ]
    });
    
    const { getByTestId } = render(
      <EditorProvider initialFile={testFile}>
        <FileDisplay />
      </EditorProvider>
    );
    
    // File should be available in context
    expect(getByTestId('has-file').textContent).to.equal('true');
    expect(getByTestId('track-count').textContent).to.equal('1');
  });
  
  it('should handle state updates through dispatch', () => {
    // Create a component that updates state through dispatch
    const StateUpdater = () => {
      const { state, dispatch } = useEditorContext();
      
      const updateSettings = () => {
        dispatch({ 
          type: 'SET_SETTINGS', 
          payload: { fileView: true, labels: true } 
        });
      };
      
      return (
        <div>
          <button data-testid="update-button" onClick={updateSettings}>Update Settings</button>
          <div data-testid="file-view">{state.settings.fileView ? 'true' : 'false'}</div>
          <div data-testid="labels">{state.settings.labels ? 'true' : 'false'}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <EditorProvider>
        <StateUpdater />
      </EditorProvider>
    );
    
    // Initial settings
    expect(getByTestId('file-view').textContent).to.equal('false');
    expect(getByTestId('labels').textContent).to.equal('false');
    
    // Update settings
    getByTestId('update-button').click();
    
    // Settings should be updated
    expect(getByTestId('file-view').textContent).to.equal('true');
    expect(getByTestId('labels').textContent).to.equal('true');
  });
}); 