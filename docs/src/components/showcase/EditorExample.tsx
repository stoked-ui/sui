import {ITimelineFileAction } from "@stoked-ui/timeline";
import {namedId} from "@stoked-ui/media-selector";
import {Controllers} from "@stoked-ui/editor";
import EditorFile from "@stoked-ui/editor/src/Editor/EditorFile";
const idFunc = () => namedId('track');

const EditorExample = new EditorFile({
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
      controller: Controllers['video'],

      actions: [{
        name: 'vast-multiverse',
        start: 11,
        end: 36,
        trimStart: 29.5,
        volume: [
          [0, 0, 32],
          [1, 32, 41.5],
          [0, 41.5, ]
        ],
        z: -2,
        fit: 'fill' as 'fill',

      }]
    },
    {
      id: idFunc(),
      name: 'tunnel alpha',
      url: '/static/editor/background-alpha.webm',
      controller: Controllers['video'],
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
      controller: Controllers['video'],
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
      controller: Controllers['video'],
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
      url: '/static/timeline/docs/overview/funeral.m4a',
      image: '/static/editor/adam-rodgers.jpeg',
      controller: Controllers['audio'],
      actions: [{
        name: 'funeral',
        start: 3,
        end: 37.6,
        trimStart: .5,
        volume: [[0, 14, 20.5], [4, 20.5,],],
      }]
    },
  ]
});

export default EditorExample;
