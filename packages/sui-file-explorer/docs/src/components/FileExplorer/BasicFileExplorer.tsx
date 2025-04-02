import * as React from 'react';
import { FileExplorer } from '../../../../src';

export default function BasicFileExplorer() {
  const [items] = React.useState([
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
  ]);

  return (
    <FileExplorer 
      items={items}
      defaultExpandedItems={['folder-1']}
    />
  );
} 
