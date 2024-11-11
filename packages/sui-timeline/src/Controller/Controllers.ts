import AudioController from "./AudioController";
import type { IController } from "./Controller.types";

const Controllers:  Record<string, IController> = { audio: AudioController };
export default Controllers ;
