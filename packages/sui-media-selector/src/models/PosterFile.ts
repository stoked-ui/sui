import type {IImageFile} from "./ImageFile";
import { ImageFile} from "./ImageFile";

export interface IPosterFile extends IImageFile {
  timestamp?: number;
}

export default class PosterFile extends ImageFile implements IPosterFile {
  timestamp?: number;

  constructor(props: IPosterFile) {
    super(props);
    this.timestamp = props.timestamp;
  }
}
