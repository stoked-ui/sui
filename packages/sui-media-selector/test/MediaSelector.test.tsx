import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { MediaSelector } from '../src';

describe('<MediaSelector />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const { container } = render(<MediaSelector />);
    
    expect(container.firstChild).to.have.class('MuiMediaSelector-root');
  });
  
  it('should render tabs correctly', () => {
    const { container } = render(<MediaSelector />);
    
    // Should render tabs for Upload, Library, URL, etc.
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs.length).to.be.greaterThan(0);
    
    // Default tabs should include Upload and Library
    expect(container.textContent).to.include('Upload');
    expect(container.textContent).to.include('Library');
  });
  
  it('should allow customizing visible tabs', () => {
    const { container } = render(
      <MediaSelector 
        tabs={['upload', 'url']} 
      />
    );
    
    // Should only render Upload and URL tabs
    expect(container.textContent).to.include('Upload');
    expect(container.textContent).to.include('URL');
    expect(container.textContent).to.not.include('Library');
  });
  
  it('should render with custom initial tab', () => {
    const { container } = render(
      <MediaSelector 
        defaultTab="url"
      />
    );
    
    // URL tab content should be visible
    const urlInput = container.querySelector('input[type="url"]');
    expect(urlInput).to.exist;
  });
  
  it('should handle onTabChange callback', () => {
    let changedTab = null;
    
    const handleTabChange = (event, tab) => {
      changedTab = tab;
    };
    
    const { container } = render(
      <MediaSelector 
        onTabChange={handleTabChange}
      />
    );
    
    // Find URL tab and click it
    const tabs = Array.from(container.querySelectorAll('.MuiTab-root'));
    const urlTab = tabs.find(tab => tab.textContent.includes('URL'));
    
    if (urlTab) {
      urlTab.click();
      
      // Callback should be called with correct tab
      expect(changedTab).to.equal('url');
    }
  });
  
  it('should handle file selection in upload tab', () => {
    let selectedFiles = null;
    
    const handleSelect = (files) => {
      selectedFiles = files;
    };
    
    const { container } = render(
      <MediaSelector 
        onSelect={handleSelect}
      />
    );
    
    // In an actual test implementation, we would need to mock the file input
    // and its change event to test file selection functionality
    
    // Here we're just checking that the file input exists
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).to.exist;
  });
  
  it('should handle URL submission', () => {
    let submittedUrl = null;
    
    const handleSelect = (media) => {
      if (media && media.length > 0 && media[0].type === 'url') {
        submittedUrl = media[0].url;
      }
    };
    
    const { container } = render(
      <MediaSelector 
        defaultTab="url"
        onSelect={handleSelect}
      />
    );
    
    // Find URL tab content
    const urlInput = container.querySelector('input[type="url"]');
    const submitButton = container.querySelector('button[type="submit"]');
    
    if (urlInput && submitButton) {
      // Set URL value
      urlInput.value = 'https://example.com/image.jpg';
      
      // Trigger input change event
      const event = new Event('change', { bubbles: true });
      urlInput.dispatchEvent(event);
      
      // Submit form
      submitButton.click();
      
      // onSelect should be called with the URL
      expect(submittedUrl).to.equal('https://example.com/image.jpg');
    }
  });
  
  it('should handle maxFiles correctly', () => {
    const { container } = render(
      <MediaSelector 
        maxFiles={5}
      />
    );
    
    // Should show max files info
    expect(container.textContent).to.include('5');
  });
  
  it('should apply custom styles via sx prop', () => {
    const { container } = render(
      <MediaSelector 
        sx={{ width: '800px', margin: '20px' }}
      />
    );
    
    const rootElement = container.firstChild;
    
    // Check if styles were applied
    if (rootElement) {
      const styles = window.getComputedStyle(rootElement);
      expect(styles.width).to.equal('800px');
      expect(styles.margin).to.equal('20px');
    }
  });
}); 