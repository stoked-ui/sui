import * as React from 'react';
/**
 * Basic File Explorer component
 *
 * This component represents a basic file explorer with a list of items.
 * It uses the `FileExplorer` component provided by the parent module and passes in the necessary props to render the items.
 */

export default function BasicFileExplorer() {
  /**
   * Initial state for the component, consisting of an array of items.
   *
   * @type {Array<Object>}
   */
  const [items] = React.useState([
    {
      /**
       * Unique identifier for the item
       * @type {string}
       */
      id: 'folder-1',
      /**
       * Name of the folder/file
       * @type {string}
       */
      name: 'Documents',
      /**
       * Type of the item (folder or file)
       * @type {string}
       */
      type: 'folder',
      /**
       * Children items, if any
       * @type {Array<Object>}
       */
      children: [
        {
          /**
           * Unique identifier for the child item
           * @type {string}
           */
          id: 'file-1',
          /**
           * Name of the file
           * @type {string}
           */
          name: 'Resume.pdf',
          /**
           * Type of the child item (file)
           * @type {string}
           */
          type: 'file'
        },
        {
          /**
           * Unique identifier for the child item
           * @type {string}
           */
          id: 'file-2',
          /**
           * Name of the file
           * @type {string}
           */
          name: 'Cover Letter.docx',
          /**
           * Type of the child item (file)
           * @type {string}
           */
          type: 'file'
        }
      ]
    },
    {
      /**
       * Unique identifier for the item
       * @type {string}
       */
      id: 'folder-2',
      /**
       * Name of the folder/file
       * @type {string}
       */
      name: 'Images',
      /**
       * Type of the item (folder or file)
       * @type {string}
       */
      type: 'folder',
      /**
       * Children items, if any
       * @type {Array<Object>}
       */
      children: [
        {
          /**
           * Unique identifier for the child item
           * @type {string}
           */
          id: 'file-3',
          /**
           * Name of the file
           * @type {string}
           */
          name: 'Profile Picture.jpg',
          /**
           * Type of the child item (file)
           * @type {string}
           */
          type: 'file'
        }
      ]
    }
  ]);

  return (
    <FileExplorer 
      /**
       * Items to be rendered in the file explorer
       * @type {Array<Object>}
       */
      items={items}
      /**
       * Default expanded items, if any
       * @type {Array<string>}
       */
      defaultExpandedItems={['folder-1']}
    />
  );
}