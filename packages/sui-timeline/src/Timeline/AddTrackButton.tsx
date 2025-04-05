/**
 * Functional component for an "Add Track" button.
 * 
 * @param {Object} props - The props object.
 * @param {Function} props.onAddFiles - Callback function to trigger when files are added.
 * 
 * @returns {JSX.Element} React component rendering the "Add Track" button.
 * 
 * @example
 * <AddTrackButton onAddFiles={handleAddFiles} />
 * 
 * @fires onClick
 * 
 * @see Fab, AddIcon
 */
export default function AddTrackButton({ onAddFiles }: { onAddFiles?: () => void }) {
  // {(!file?.tracks || !file?.tracks.length) &&
   return (
     <Fab color="primary"
       size={'small'}
       sx={{position: 'absolute', marginLeft: '4px', marginTop: '3px', scale: 0.8, transformOrigin: '0% 0%'}}
       onClick={() => {
         if (onAddFiles) {
           onAddFiles();
         }
       }}>
      <AddIcon fontSize={'large'}/>
    </Fab>)
}