import AudioController from "./AudioController";
import type { IController } from "./Controller.types";
import Controller from "./Controller";

const Controllers:  Record<string, Controller> = { audio: AudioController };
export default Controllers ;
