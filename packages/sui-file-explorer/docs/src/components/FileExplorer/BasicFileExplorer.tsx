/**
 * Functional component representing a basic file explorer.
 * Displays a list of folders and files.
 *
 * @returns {JSX.Element} React component
 */
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