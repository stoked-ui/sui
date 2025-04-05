/**
 * React component for a basic text editor.
 * 
 * @returns {JSX.Element} React component
 * 
 * @example
 * <BasicEditor />
 */
export default function BasicEditor() {
  return (
    <Box sx={{ height: '600px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Editor 
        fileView={true}
        labels={true}
      />
    </Box>
  );
}