import * as React from 'react';
import {namedId} from "@stoked-ui/media-selector";
import { AudioController } from "@stoked-ui/timeline";
import { IEditorFileAction,  EditorFile, IEditorFile, VideoController, IEditorFileTrack } from "@stoked-ui/editor";

const idFunc = () => namedId('track');

const EditorExample: IEditorFile = new EditorFile({
  name: 'Stoked UI - Multiverse',
  description: 'demonstrate the @stoked-ui/editor features',
  author: 'Brian Stoker',
  created: 1729783494563,
  backgroundColor: '#000',
  tracks: [
    {
      id: idFunc(),
      name: 'dr. strange trailer',
      url: '/static/editor/vast-multiverse.mp4',
      controller: VideoController,
      actions: [{
        name: 'vast-multiverse',
        start: 11,
        end: 36,
        trimStart: 29.5,
        volume: [
          [0, 0, 32],
          [1, 32, 40.5],
          [0, 40.5, ]
        ],
        z: -2,
        fit: 'fill' as 'fill',

      }]
    },
    {
      id: idFunc(),
      name: 'tunnel alpha',
      url: '/static/editor/background-alpha.webm',
      controller: VideoController,
      actions: [{
        name: 'background-alpha',
        start: 0,
        end: 15.3,
        trimStart: 1,
        loop: false,
        fit: 'fill' as 'fill',
        z: -1,
      }]
    },
    {
      id: idFunc(),
      name: 'sui logo',
      url: '/static/editor/stoked-ui.webm',
      controller: VideoController,
      actions: [{
        name: 'stoked-ui',
        start: 0,
        end: 12,
      }]
    },
    {
      id: idFunc(),
      name: 'sui reverse logo',
      url: '/static/editor/stoked-ui-reverse.webm',
      controller: VideoController,
      actions: [{
        name: 'stoked-ui-reverse',
        start: 35.7,
        end: 40,
        volume: [[0.5, 0,]],
      }]
    },
    {
      id: idFunc(),
      name: 'Funeral - Adam Rodgers',
      url: '/static/editor/funeral.mp3',
      image: '/static/editor/adam-rodgers.jpeg',
      controller: AudioController,
      actions: [{
        name: 'funeral',
        start: 3,
        end: 37.6,
        trimStart: .5,
        volume: [[0, 14, 20.5], [4, 20.5,],],
      }] as IEditorFileAction[]
    },
  ] as IEditorFileTrack[],
});

export default EditorExample;
