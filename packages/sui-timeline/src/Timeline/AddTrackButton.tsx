/**
 * AddTrackButton component
 *
 * @param {Object} props - Component props
 * @param {function} props.onAddFiles - Callback function to add files
 */
export default function AddTrackButton({ onAddFiles }: { onAddFiles?: () => void }) {
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
    </Fab>
  );
}