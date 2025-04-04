import * as React from 'react';
/**
 * A MultiTrackTimeline component that displays a timeline with different tracks.
 *
 * @description
 * This component uses the SUI Timeline and material-ui's Box to create a responsive timeline layout.
 */
export default function MultiTrackTimeline() {
  const tracks = [
    /**
     * Video track properties
     *
     * @property {string} id - Unique identifier for the track
     * @property {string} name - Name of the track
     * @property {string} type - Type of the track (video, audio, or text)
     * @property {Object[]} actions - Array of actions for the track
     */
    {
      id: 'video-track',
      name: 'Video',
      type: 'video',
      actions: [
        /**
         * Video action properties
         *
         * @property {string} id - Unique identifier for the action
         * @property {number} start - Start time of the action in milliseconds
         * @property {number} duration - Duration of the action in seconds
         * @property {string} name - Name of the action
         */
        { id: 'video-1', start: 0, duration: 15, name: 'Intro Video' },
        { id: 'video-2', start: 16, duration: 20, name: 'Main Segment' }
      ]
    },
    /**
     * Audio track properties
     *
     * @property {string} id - Unique identifier for the track
     * @property {string} name - Name of the track
     * @property {string} type - Type of the track (video, audio, or text)
     * @property {Object[]} actions - Array of actions for the track
     */
    {
      id: 'audio-track',
      name: 'Audio',
      type: 'audio',
      actions: [
        /**
         * Audio action properties
         *
         * @property {string} id - Unique identifier for the action
         * @property {number} start - Start time of the action in milliseconds
         * @property {number} duration - Duration of the action in seconds
         * @property {string} name - Name of the action
         */
        { id: 'audio-1', start: 2, duration: 10, name: 'Background Music' },
        { id: 'audio-2', start: 14, duration: 25, name: 'Narration' }
      ]
    },
    /**
     * Text track properties
     *
     * @property {string} id - Unique identifier for the track
     * @property {string} name - Name of the track
     * @property {string} type - Type of the track (video, audio, or text)
     * @property {Object[]} actions - Array of actions for the track
     */
    {
      id: 'text-track',
      name: 'Subtitles',
      type: 'text',
      actions: [
        /**
         * Text action properties
         *
         * @property {string} id - Unique identifier for the action
         * @property {number} start - Start time of the action in milliseconds
         * @property {number} duration - Duration of the action in seconds
         * @property {string} name - Name of the action
         */
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