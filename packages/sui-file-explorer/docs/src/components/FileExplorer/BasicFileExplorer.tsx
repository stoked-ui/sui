import * as React from 'react';
import { FileExplorer } from '../../../../src';

/**
 * @typedef {Object} FileItem
 * @property {string} id - Unique identifier for the file or folder
 * @property {string} name - Display name of the file or folder
 * @property {'file'|'folder'} type - Type of the item, either 'file' or 'folder'
 * @property {FileItem[]} [children] - Nested children for folders
 */

/**
 * @description A basic implementation of the FileExplorer component, displaying a predefined set of folders and files.
 * 
 * @returns {JSX.Element} Renders the FileExplorer component with predefined items.
 * 
 * @example
 * <BasicFileExplorer />
 */
export default function BasicFileExplorer() {
  /** 
   * @type {FileItem[]} 
   * @description Array of file and folder items to be displayed in the FileExplorer.
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