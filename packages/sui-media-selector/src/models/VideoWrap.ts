import {IVideoFile} from "./VideoFile";
import {IPlacement} from "./Placement";
import {IVideoWatermark} from "./Watermark";

export default interface IVideoWrap {
  placement?: IPlacement
  epilogue?: IVideoFile
  watermark?: IVideoWatermark
}
