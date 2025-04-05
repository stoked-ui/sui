/**
 * Represents a basic timeline component.
 * This component displays a timeline with specified tracks and actions.
 *
 * @returns {JSX.Element} The rendered basic timeline component.
 */
export default function BasicTimeline() {
  const [file, setFile] = React.useState<TimelineFile | null>(null);
  
  React.useEffect(() => {
    // Create a timeline file with sample data
    const timelineFile = new TimelineFile({
      tracks: [
        {
          id: 'track-1',
          name: 'Track 1',
          actions: [
            { id: 'action-1', start: 0, duration: 10, name: 'Action 1' },
            { id: 'action-2', start: 15, duration: 5, name: 'Action 2' }
          ]
        },
        {
          id: 'track-2',
          name: 'Track 2',
          actions: [
            { id: 'action-3', start: 5, duration: 8, name: 'Action 3' }
          ]
        }
      ]
    });
    
    setFile(timelineFile);
  }, []);
  
  return (
    <Timeline 
      file={file} 
      labels={true} 
    />
  );
}