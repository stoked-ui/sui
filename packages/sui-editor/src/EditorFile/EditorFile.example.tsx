/**
 * Import necessary modules and types.
 */
import { namedId } from '@stoked-ui/common';
import EditorFile, { IEditorFile } from "./EditorFile";
import VideoController from "../Controllers/VideoController";
import AudioController from "../Controllers/AudioController";
import {IEditorAction, IEditorFileAction} from "../EditorAction";
import {IEditorFileTrack} from "../EditorTrack";
import { createAction } from '@stoked-ui/timeline';

/**
 * Function to generate unique track IDs.
 *
 * @returns {string} A unique ID for a track.
 */
const idFunc = () => namedId('track');

/**
 * Example EditorFile object with multiple tracks.
 *
 * @class EditorExample
 * @extends {EditorFile}
 */
const EditorExample: IEditorFile = new EditorFile({
  /**
   * Unique identifier for the editor file.
   *
   * @type {string}
   */
  id: 'stoked-ui-editor-project-example',
  
  /**
   * Name of the editor file.
   *
   * @type {string}
   */
  name: 'Stoked UI - Multiverse',
  
  /**
   * Description of the editor file.
   *
   * @type {string}
   */
  description: 'demonstrate the @stoked-ui/editor features',
  
  /**
   * Author of the editor file.
   *
   * @type {string}
   */
  author: 'Brian Stoker',
  
  /**
   * Timestamp for when the editor file was created.
   *
   * @type {number}
   */
  created: 1729783494563,
  
  /**
   * Version number of the editor file.
   *
   * @type {number}
   */
  version: 1,
  
  /**
   * Array of tracks within the editor file.
   *
   * @type {IEditorFileTrack[]}
   */
  tracks: [
    {
      /**
       * Unique ID for the track.
       *
       * @type {string}
       */
      id: idFunc(),
      
      /**
       * Name of the track.
       *
       * @type {string}
       */
      name: 'dr. strange trailer',
      
      /**
       * URL for the track's media file.
       *
       * @type {string}
       */
      url: '/static/editor/vast-multiverse.mp4',
      
      /**
       * Controller to use for this track.
       *
       * @type {VideoController}
       */
      controller: VideoController,
      
      /**
       * Array of actions within the track.
       *
       * @type {IEditorAction[]}
       */
      actions: [createAction<IEditorAction>({
        /**
         * Name of the action.
         *
         * @type {string}
         */
        name: 'vast-multiverse',
        
        /**
         * Start time for the action.
         *
         * @type {number}
         */
        start: 11,
        
        /**
         * End time for the action.
         *
         * @type {number}
         */
        end: 36,
        
        /**
         * Trim start value for the action.
         *
         * @type {number}
         */
        trimStart: 29.5,
        
        /**
         * Array of volume values for the action.
         *
         * @type {number[]}
         */
        volume: [
          [0, 0, 32],
          [1, 32, 40.5],
          [.35, 40.5, ]
        ],
        
        /**
         * Z-index value for the action.
         *
         * @type {number}
         */
        z: -2,
        
        /**
         * Fit type for the action.
         *
         * @type {'fill'}
         */
        fit: 'fill' as 'fill',
      })]
    },
    {
      id: idFunc(),
      name: 'tunnel alpha',
      url: '/static/editor/background-alpha.webm',
      controller: VideoController,
      actions: [createAction<IEditorAction>({
        name: 'background-alpha',
        start: 0,
        end: 15.3,
        trimStart: 1,
        loop: false,
        fit: 'fill' as 'fill',
        z: -1,
      })]
    },
    {
      id: idFunc(),
      name: 'sui logo',
      url: '/static/editor/stoked-ui.webm',
      controller: VideoController,
      actions: [createAction<IEditorAction>({
        name: 'stoked-ui',
        loop: 3,
        start: 0,
        end: 12,
      })]
    },
    {
      id: idFunc(),
      name: 'sui reverse logo',
      url: '/static/editor/stoked-ui-reverse.webm',
      controller: VideoController,
      actions: [createAction<IEditorAction>({
        name: 'stoked-ui-reverse',
        start: 35.7,
        end: 40,
        volume: [[0.5, 0,]],
      })]
    },
    {
      id: idFunc(),
      name: 'Funeral - Adam Rodgers',
      url: '/static/editor/funeral.mp3',
      image: '/static/editor/funeral.jpg',
      controller: AudioController,
      actions: [createAction<IEditorAction>({
        /**
         * Name of the action.
         *
         * @type {string}
         */
        name: 'funeral-adam-rodgers',
        
        /**
         * Start time for the action.
         *
         * @type {number}
         */
        start: 0,
        
        /**
         * End time for the action.
         *
         * @type {number}
         */
        end: 100,
      })]
    }
  ]
});