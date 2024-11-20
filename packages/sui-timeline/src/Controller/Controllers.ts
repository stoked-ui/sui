import AudioController from "./AudioController";
import Controller from "./Controller";

const Controllers:  Record<string, Controller> = { audio: AudioController };
export default Controllers ;


export function ReplaceAudioController(controller: Controller) {
  Controllers.audio = controller;
}
