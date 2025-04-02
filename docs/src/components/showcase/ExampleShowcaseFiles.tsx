import {Constructor, namedId} from "@stoked-ui/common";
import {
  AudioController,
  IEditorFileAction,
  VideoController,
  IEditorFileTrack,
  EditorFile, IEditorFileProps,
} from "@stoked-ui/editor";
import {ITimelineFileProps, TimelineFile} from "@stoked-ui/timeline";

const idFunc = () => namedId('track');

export const EditorVideoExampleProps = {
  id: 'stoked-ui-video-project-example',
  name: 'Stoked UI - Video Multiverse',
  description: 'Demonstrate the @stoked-ui/editor video features',
  author: 'Brian Stoker',
  created: 1729783494563,
  version: 1,
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
          [0,0,15.2],
          [1,15.2,22.5],
          [0,22.5, 36]
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
        loop: 3,
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
        start: 2.5,
        end: 37.6,
        trimStart: 7.2,
        volume: [[2, 2.5, 37.6]],
      }] as IEditorFileAction[]
    },
  ] as IEditorFileTrack[],
}

export const EditorAudioExampleProps = {
  id: 'stoked-ui-audio-project-example',
  name: 'Stoked UI - Audio Compilation',
  description: 'Demonstrate the @stoked-ui/editor audio features with a unique audio mix',
  author: 'Brian Stoker',
  created: Date.now(),
  tracks: [
    {
      id: idFunc(),
      name: 'Ocean Waves',
      url: 'https://archive.org/download/Ocean-Waves-Sounds/ocean-waves.mp3',
      controllerName: 'audio',
      actions: [{
        name: 'ocean-waves',
        start: 0,
        end: 30,
        volume: [
          [0, 0, 10],
          [1, 10, 20],
          [0.5, 20, 30],
        ],
        trimStart: 2,
        loop: false,
        fit: 'fill' as 'fill',
        z: -2,
      }]
    },
    {
      id: idFunc(),
      name: 'Acoustic Guitar',
      url: 'https://archive.org/download/AcousticGuitarMusic/acoustic-guitar.mp3',
      controllerName: 'audio',
      actions: [{
        name: 'acoustic-guitar',
        start: 5,
        end: 45,
        trimStart: 0,
        loop: true,
        volume: [[0.8, 5, 15], [1, 15, 30], [0.5, 30, 45]],
      }]
    },
    {
      id: idFunc(),
      name: 'Rainforest Ambience',
      url: 'https://archive.org/download/Rainforest-Ambience/rainforest.mp3',
      controllerName: 'audio',
      actions: [{
        name: 'rainforest',
        start: 0,
        end: 25,
        volume: [
          [0.5, 0, 10],
          [1, 10, 20],
          [0.3, 20, 25],
        ],
        trimStart: 1,
        loop: false,
        z: -1,
      }]
    },
    {
      id: idFunc(),
      name: 'Chill Piano',
      url: 'https://archive.org/download/ChillPianoMusic/chill-piano.mp3',
      controllerName: 'audio',
      actions: [{
        name: 'chill-piano',
        start: 0,
        end: 30,
        volume: [
          [0, 0, 5],
          [1, 5, 25],
          [0.5, 25, 30],
        ],
        trimStart: 0,
        loop: true,
        z: 0,
      }]
    },
    {
      id: idFunc(),
      name: 'Outro Chime',
      url: 'https://archive.org/download/OutroChimeEffect/outro-chime.mp3',
      controllerName: 'audio',
      actions: [{
        name: 'outro-chime',
        start: 28,
        end: 30,
        volume: [[0.8, 28, 30]],
      }]
    },
  ]
};

export const createTimelineFile = async <
  FilePropsType extends ITimelineFileProps = ITimelineFileProps,
  FileType extends TimelineFile = TimelineFile,
>(props: FilePropsType, FileConstructor: Constructor<FileType>, editorId: string) => {
  const file = new FileConstructor(props);
  await file.preload(editorId);
  return file;
}


export const createEditorFile = async <
  FilePropsType extends IEditorFileProps = IEditorFileProps,
  FileType extends EditorFile = EditorFile,
>(props: FilePropsType, FileConstructor: Constructor<FileType>, editorId: string) => {
  const file = await createTimelineFile(props, FileConstructor, editorId) as EditorFile;
  await file.updateStore();
  return file;
}


