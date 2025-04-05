/**
 * Represents a multi-track timeline component.
 * Displays different types of tracks (video, audio, text) with associated actions.
 *
 * @returns {JSX.Element} JSX element representing the multi-track timeline component.
 */
export default function MultiTrackTimeline() {
  /**
   * Array of track objects with id, name, type, and actions.
   *
   * @typedef {Object} Track
   * @property {string} id - The unique identifier of the track.
   * @property {string} name - The name of the track.
   * @property {string} type - The type of the track (video, audio, text).
   * @property {Object[]} actions - Array of action objects within the track.
   */

  const tracks = [
    {
      id: 'video-track',
      name: 'Video',
      type: 'video',
      actions: [
        { id: 'video-1', start: 0, duration: 15, name: 'Intro Video' },
        { id: 'video-2', start: 16, duration: 20, name: 'Main Segment' }
      ]
    },
    {
      id: 'audio-track',
      name: 'Audio',
      type: 'audio',
      actions: [
        { id: 'audio-1', start: 2, duration: 10, name: 'Background Music' },
        { id: 'audio-2', start: 14, duration: 25, name: 'Narration' }
      ]
    },
    {
      id: 'text-track',
      name: 'Subtitles',
      type: 'text',
      actions: [
        { id: 'text-1', start: 5, duration: 5, name: 'Introduction Text' },
        { id: 'text-2', start: 18, duration: 10, name: 'Main Text' },
        { id: 'text-3', start: 30, duration: 5, name: 'Closing Text' }
      ]
    }
  ];

  return (
    <Box sx={{ height: '300px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Timeline 
        tracks={tracks}
        labels={true}
        colors={{
          video: '#f44336',
          audio: '#4caf50',
          text: '#2196f3'
        }}
      />
    </Box>
  );
}