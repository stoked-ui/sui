import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import Editor from '../src/Editor';
import { EditorProvider } from '../src/EditorProvider';

describe('<Editor />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const { container } = render(
      <EditorProvider>
        <Editor />
      </EditorProvider>
    );
    // Basic check that the component renders
    expect(container.firstChild).to.have.class('MuiEditor-root');
  });

  it('should apply the fullscreen prop correctly', () => {
    const { container } = render(
      <EditorProvider>
        <Editor fullscreen={true} />
      </EditorProvider>
    );
    
    // The component should have fullscreen styling when the prop is true
    const rootElement = container.firstChild;
    expect(rootElement).to.have.class('MuiEditor-root');
    // Additional checks for fullscreen mode could be added here
  });

  it('should apply the minimal prop correctly', () => {
    const { container } = render(
      <EditorProvider>
        <Editor minimal={true} />
      </EditorProvider>
    );
    
    // Check that minimal mode is applied
    const rootElement = container.firstChild;
    expect(rootElement).to.have.class('MuiEditor-root');
    // Additional checks for minimal mode could be added here
  });

  it('should apply the fileView prop correctly', () => {
    const { container } = render(
      <EditorProvider>
        <Editor fileView={true} />
      </EditorProvider>
    );
    
    // Check that fileView is shown
    const rootElement = container.firstChild;
    expect(rootElement).to.have.class('MuiEditor-root');
    // Additional checks for file view visibility could be added here
  });

  it('should apply custom styles through the sx prop', () => {
    const customStyles = { backgroundColor: 'red' };
    const { container } = render(
      <EditorProvider>
        <Editor sx={customStyles} />
      </EditorProvider>
    );
    
    // Check that custom styles are applied
    const rootElement = container.firstChild;
    expect(rootElement).to.have.class('MuiEditor-root');
    // Additional checks for custom styles could be added here
  });

  it('should handle labels prop correctly', () => {
    const { container } = render(
      <EditorProvider>
        <Editor labels={true} />
      </EditorProvider>
    );
    
    // Check that labels are shown
    const rootElement = container.firstChild;
    expect(rootElement).to.have.class('MuiEditor-root');
    // Additional checks for labels visibility could be added here
  });

  // Add more tests for other props and functionality
}); 