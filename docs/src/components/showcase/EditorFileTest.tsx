import { namedId } from '@stoked-ui/common';
import {
  AudioController,
  IEditorFileAction,
  EditorFile,
  IEditorFileTrack,
} from "@stoked-ui/editor";

const idFunc = () => namedId('track');
function getFileProps(song: string, artist: string) {
  const filename = song.replace(/ /g, '-').toLowerCase();
  return {
    id: 'editor-file-test',
    name: 'Stoked UI - Multiverse',
    description: 'demonstrate the @stoked-ui/editor features',
    author: 'Brian Stoker',
    created: 1729783494563,
    version: 1,
    tracks: [{
      id: idFunc(),
      name: `${song} - ${artist}`,

      url: `/static/editor/${filename}.mp3`,
      controller: AudioController,
      actions: [{
        name: filename, start: 0, end: 200, trimStart: .5,
      }] as IEditorFileAction[]
    },] as IEditorFileTrack[],
  };
}

function CreateAudioFile(song: string, artist: string) {
  return new EditorFile(getFileProps(song, artist));
}

export default CreateAudioFile;

