import * as React from 'react';
import { expect } from 'chai';
import { fireEvent } from '@testing-library/react';
import { render } from '@stoked-ui/internal-test-utils';
import { FileExplorerBasic } from '../src';
import { MediaTypeEnum } from '../src';

describe('<FileExplorerBasic />', () => {
  // Sample test data
  const testItems = [
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      children: [
        { 
          id: 'file-1', 
          name: 'Resume.pdf', 
          type: 'file',
          mediaType: MediaTypeEnum.PDF
        },
        { 
          id: 'file-2', 
          name: 'Report.docx', 
          type: 'file',
          mediaType: MediaTypeEnum.DOCUMENT
        }
      ]
    },
    {
      id: 'folder-2',
      name: 'Images',
      type: 'folder',
      mediaType: MediaTypeEnum.FOLDER,
      children: [
        { 
          id: 'file-3', 
          name: 'Photo.jpg', 
          type: 'file',
          mediaType: MediaTypeEnum.IMAGE
        }
      ]
    }
  ];

  it('renders without crashing', () => {
    const { getByRole } = render(
      <FileExplorerBasic items={testItems} />
    );
    expect(getByRole('list')).to.exist;
  });

  it('renders items correctly', () => {
    const { getAllByRole } = render(
      <FileExplorerBasic items={testItems} />
    );
    // Should render 2 top-level folder items
    const listItems = getAllByRole('listitem');
    expect(listItems).to.have.length(2);
  });

  it('expands items when clicked', () => {
    const { getAllByRole, getByText } = render(
      <FileExplorerBasic items={testItems} />
    );
    
    // Find and click the "Documents" folder
    const documentsFolder = getByText('Documents');
    fireEvent.click(documentsFolder);
    
    // Now we should see child items (original 2 folders + 2 files from Documents)
    const listItems = getAllByRole('listitem');
    expect(listItems).to.have.length(4);
    expect(getByText('Resume.pdf')).to.exist;
    expect(getByText('Report.docx')).to.exist;
  });

  it('handles click events on items', () => {
    let clickedId = '';
    
    const { getByText } = render(
      <FileExplorerBasic 
        items={testItems} 
        onClickItem={(id: string) => { clickedId = id; }}
      />
    );
    
    // Find and click a folder
    const documentsFolder = getByText('Documents');
    fireEvent.click(documentsFolder);
    expect(clickedId).to.equal('folder-1');
    
    // Find and click a file
    const resumeFile = getByText('Resume.pdf');
    fireEvent.click(resumeFile);
    expect(clickedId).to.equal('file-1');
  });

  it('applies custom styles via sx prop', () => {
    const { getByRole } = render(
      <FileExplorerBasic 
        items={testItems} 
        sx={{ backgroundColor: 'rgb(240, 240, 240)' }}
      />
    );
    
    const list = getByRole('list');
    const styles = window.getComputedStyle(list);
    expect(styles.backgroundColor).to.equal('rgb(240, 240, 240)');
  });
}); 
