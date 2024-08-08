import { IMarkerFile } from './MarkerFile';
import IVideoWrap from './VideoWrap';
import MediaFile, { IMediaFile } from './MediaFile';
import { IPosterFile } from './PosterFile';

export interface IMediaData {
  originals?: IMediaFile[];
  finals?: IMediaFile[];
  poster?: IPosterFile;
  markers?: IMarkerFile[];
  files?: IMediaFile[];
  wraps?: IVideoWrap[];
  title?: string;
  description?: string;
  height?: number;
  width?: number;
  loaded?: boolean;
}

export default class MediaData implements IMediaData {
  originals?: IMediaFile[] = new Array<IMediaFile>();
  finals?: IMediaFile[] = new Array<IMediaFile>();
  poster?: IPosterFile;
  markers?: IMarkerFile[] = new Array<IMarkerFile>();
  files?: IMediaFile[] = new Array<MediaFile>();
  wraps?: IVideoWrap[] = new Array<IVideoWrap>();
  title?: string = '';
  description?: string;
  height?: number;
  width?: number;
  loaded?: boolean = false;

  constructor(props?: IMediaData) {
    if (!props) return;
    this.originals = props.originals || this.originals;
    this.finals = props.finals || this.finals;
    this.poster = props.poster || this.poster;
    this.markers = props.markers || this.markers;
    this.files = props.files || this.files;
    this.wraps = props.wraps || this.wraps;
    this.title = props.title || this.title;
    this.description = props.description || this.description;
    this.height = props.height || this.height;
    this.width = props.width || this.width;
    this.loaded = false;
  }
}
