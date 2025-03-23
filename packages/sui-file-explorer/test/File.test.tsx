import * as React from 'react';
import { expect } from 'chai';
import { createRenderer, fireEvent } from '@stoked-ui/internal-test-utils';
import { File } from '../src/File';

describe('<File />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const { container } = render(
      <File
        item={{ id: 'file-1', name: 'test.txt', type: 'file' }}
      />
    );
    
    expect(container.firstChild).to.have.class('MuiFileExplorer-item');
  });
  
  it('should display the file name correctly', () => {
    const { container } = render(
      <File 
        item={{ id: 'file-1', name: 'document.pdf', type: 'file' }}
      />
    );
    
    expect(container.textContent).to.include('document.pdf');
  });
  
  it('should render folder with children correctly', () => {
    const folderItem = {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'resume.pdf', type: 'file' }
      ]
    };
    
    const { container } = render(
      <File 
        item={folderItem}
        expandedItems={['folder-1']}
      />
    );
    
    // Should render the folder and its child
    expect(container.textContent).to.include('Documents');
    expect(container.textContent).to.include('resume.pdf');
  });
  
  it('should handle onSelect callback', () => {
    const fileItem = { id: 'file-1', name: 'test.txt', type: 'file' };
    let selectedItem = null;
    
    const handleSelect = (event, item) => {
      selectedItem = item;
    };
    
    const { container } = render(
      <File 
        item={fileItem}
        onSelect={handleSelect}
      />
    );
    
    // Click the file
    const fileElement = container.firstChild;
    if (fileElement) {
      fileElement.click();
      
      // onSelect should have been called with the correct item
      expect(selectedItem).to.equal(fileItem);
    }
  });
  
  it('should handle onExpand callback for folders', () => {
    const folderItem = { 
      id: 'folder-1', 
      name: 'Documents', 
      type: 'folder',
      children: []
    };
    
    let expandedItem = null;
    let isExpanded = false;
    
    const handleExpand = (event, item, expanded) => {
      expandedItem = item;
      isExpanded = expanded;
    };
    
    const { container } = render(
      <File 
        item={folderItem}
        onExpand={handleExpand}
      />
    );
    
    // Find and click the expand button
    const expandButton = container.querySelector('[aria-label="Toggle"]');
    if (expandButton) {
      expandButton.click();
      
      // onExpand should have been called with the correct parameters
      expect(expandedItem).to.equal(folderItem);
      expect(isExpanded).to.be.true;
    }
  });
  
  it('should apply selected state correctly', () => {
    const { container } = render(
      <File 
        item={{ id: 'file-1', name: 'test.txt', type: 'file' }}
        selectedItems={['file-1']}
      />
    );
    
    // The item should have the selected class
    expect(container.firstChild).to.have.class('Mui-selected');
  });
  
  it('should handle custom icon based on file type', () => {
    const { container } = render(
      <File 
        item={{ id: 'file-1', name: 'document.pdf', type: 'file', fileType: 'pdf' }}
      />
    );
    
    // Should find an icon element
    const icon = container.querySelector('.MuiFileExplorer-itemIcon');
    expect(icon).to.exist;
    
    // In a real test, we might check specific icon classes here, but that depends
    // on the implementation of the icon system
  });
  
  it('should be disabled when disableSelection is true', () => {
    let selectionHappened = false;
    const handleSelect = () => {
      selectionHappened = true;
    };
    
    const { container } = render(
      <File 
        item={{ id: 'file-1', name: 'test.txt', type: 'file' }}
        onSelect={handleSelect}
        disableSelection={true}
      />
    );
    
    // Click the file
    const fileElement = container.firstChild;
    if (fileElement) {
      fileElement.click();
      
      // onSelect should not have been called
      expect(selectionHappened).to.be.false;
    }
  });
}); 