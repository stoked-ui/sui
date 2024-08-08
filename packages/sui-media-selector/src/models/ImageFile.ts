import type { IMediaFile } from './MediaFile';
import MediaFile from './MediaFile';
import type { IResolution } from './Resolution';

export interface IImageFile extends IMediaFile {
  resolution?: IResolution;
}

export class ImageFile extends MediaFile implements IImageFile {
  resolution?: IResolution;

  constructor(params: IImageFile) {
    super(params);
    this.resolution = params.resolution;
  }
}
