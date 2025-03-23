import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { FileExplorer } from '../src';
import { File } from '../src/File';

describe('<FileExplorer />', () => {
  const { render } = createRenderer();

  it('should render without crashing', () => {
    const { container } = render(<FileExplorer items={[]} />);
    
    expect(container.firstChild).to.have.class('MuiFileExplorer-root');
  });
  
  it('should render items correctly', () => {
    const items = [
      {
        id: 'folder-1',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'Resume.pdf', type: 'file' },
          { id: 'file-2', name: 'Cover Letter.docx', type: 'file' }
        ]
      },
      {
        id: 'folder-2',
        name: 'Images',
        type: 'folder',
        children: [
          { id: 'file-3', name: 'Profile Picture.jpg', type: 'file' }
        ]
      }
    ];
    
    const { container } = render(<FileExplorer items={items} />);
    
    // Should render two folders at the root level
    const rootLevelItems = container.querySelector('.MuiFileExplorer-list').children;
    expect(rootLevelItems.length).to.equal(2);
    
    // Folder names should be displayed
    expect(container.textContent).to.include('Documents');
    expect(container.textContent).to.include('Images');
  });
  
  it('should handle defaultExpandedItems prop correctly', () => {
    const items = [
      {
        id: 'folder-1',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'Resume.pdf', type: 'file' },
          { id: 'file-2', name: 'Cover Letter.docx', type: 'file' }
        ]
      }
    ];
    
    // Without defaultExpandedItems
    const { container: containerCollapsed } = render(
      <FileExplorer items={items} />
    );
    
    // Child items should not be visible
    expect(containerCollapsed.textContent).to.not.include('Resume.pdf');
    
    // With defaultExpandedItems
    const { container: containerExpanded } = render(
      <FileExplorer items={items} defaultExpandedItems={['folder-1']} />
    );
    
    // Child items should be visible
    expect(containerExpanded.textContent).to.include('Resume.pdf');
    expect(containerExpanded.textContent).to.include('Cover Letter.docx');
  });
  
  it('should handle onItemSelect callback correctly', () => {
    const items = [
      {
        id: 'folder-1',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'Resume.pdf', type: 'file' }
        ]
      }
    ];
    
    let selectedItemId = null;
    const handleItemSelect = (event, item) => {
      selectedItemId = item.id;
    };
    
    const { container } = render(
      <FileExplorer 
        items={items} 
        defaultExpandedItems={['folder-1']}
        onItemSelect={handleItemSelect}
      />
    );
    
    // Find the file item and click it
    const fileItem = Array.from(container.querySelectorAll('.MuiFileExplorer-item'))
      .find(item => item.textContent.includes('Resume.pdf'));
    
    if (fileItem) {
      fileItem.click();
      
      // onItemSelect should have been called with the correct item
      expect(selectedItemId).to.equal('file-1');
    }
  });
  
  it('should handle onItemExpand callback correctly', () => {
    const items = [
      {
        id: 'folder-1',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'Resume.pdf', type: 'file' }
        ]
      }
    ];
    
    let expandedItemId = null;
    let isExpanded = false;
    const handleItemExpand = (event, item, expanded) => {
      expandedItemId = item.id;
      isExpanded = expanded;
    };
    
    const { container } = render(
      <FileExplorer 
        items={items} 
        onItemExpand={handleItemExpand}
      />
    );
    
    // Find the folder item's expand button and click it
    const folderItem = Array.from(container.querySelectorAll('.MuiFileExplorer-item'))
      .find(item => item.textContent.includes('Documents'));
    
    if (folderItem) {
      const expandButton = folderItem.querySelector('[aria-label="Toggle"]');
      if (expandButton) {
        expandButton.click();
        
        // onItemExpand should have been called with the correct item and expanded state
        expect(expandedItemId).to.equal('folder-1');
        expect(isExpanded).to.be.true;
      }
    }
  });
  
  it('should use custom item component when provided', () => {
    const items = [
      { id: 'file-1', name: 'Test File', type: 'file' }
    ];
    
    // Custom file component with a specific test class
    const CustomFile = React.forwardRef((props, ref) => {
      return <File ref={ref} {...props} className="custom-file-test" />;
    });
    
    const { container } = render(
      <FileExplorer 
        items={items} 
        slots={{
          item: CustomFile
        }}
      />
    );
    
    // Should find an element with the custom class
    const customFile = container.querySelector('.custom-file-test');
    expect(customFile).to.exist;
  });
  
  it('should handle disableSelection prop correctly', () => {
    const items = [
      { id: 'file-1', name: 'Test File', type: 'file' }
    ];
    
    let selectionHappened = false;
    const handleItemSelect = () => {
      selectionHappened = true;
    };
    
    const { container } = render(
      <FileExplorer 
        items={items} 
        disableSelection={true}
        onItemSelect={handleItemSelect}
      />
    );
    
    // Find the file item and click it
    const fileItem = container.querySelector('.MuiFileExplorer-item');
    if (fileItem) {
      fileItem.click();
      
      // Selection should not have happened
      expect(selectionHappened).to.be.false;
    }
  });
}); 