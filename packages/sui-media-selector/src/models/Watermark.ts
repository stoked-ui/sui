import {IVideoFile} from "./VideoFile";
import {IPlacement} from "./Placement";



export interface IVideoWatermark {
  video?: IVideoFile
  placement?: IPlacement
  frequency?: number
}


