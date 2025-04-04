import * as React from 'react';
import { FileExplorer } from '../../../../src';

/**
 * @description BasicFileExplorer component renders a simple file explorer with predefined items.
 * @returns {JSX.Element} A file explorer component with folders and files.
 * @example
 * <BasicFileExplorer />
 * @see FileExplorer
 */
export default function BasicFileExplorer() {
  /**
   * @typedef {Object} FileItem
   * @property {string} id - Unique identifier for the item
   * @property {string} name - Display name of the item
   * @property {string} type - Type of the item, either 'file' or 'folder'
   * @property {FileItem[]} [children] - Array of child items, applicable if the item is a folder
   */

  /** 
   * @type {FileItem[]}
   * @description Array of file and folder items to be displayed in the FileExplorer
   */
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