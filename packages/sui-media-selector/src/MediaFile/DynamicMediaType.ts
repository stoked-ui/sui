import AnimationFile from './AnimationFile'
import ImageFile from './ImageFile'
import VideoFile from './VideoFile'
import AudioFile from './AudioFile'
import MediaFile, {getFileName} from "./MediaFile";

export default class DynamicMediaType {
  static async fromFile(file: File, url: string, path?: string) {
    const mediaFile: MediaFile = MediaFile.withMimeType(file as MediaFile);
    console.log('mediaFile 1', mediaFile);
    switch(mediaFile.mediaType) {
      case 'video':
        return VideoFile.fromFileUrl(mediaFile as VideoFile, url, path);
      case 'image':
        return ImageFile.fromFile(mediaFile as ImageFile, url, path);
      case 'animation':
        return AnimationFile.fromFileUrl(mediaFile as AnimationFile, url, path);
      case 'audio':
        return AudioFile.fromFileUrl(mediaFile as AudioFile, url, path);
     /*  case 'doc':
        return new DocFile(mediaFile);
      case 'text':
        return new TextFile(mediaFile); */
      default:
        return mediaFile;
    }
  }

  static async fromUrl(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Response status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      const blob = await response.blob()
      const file = new File([blob], getFileName(url, true) ?? 'url-file', {type: contentType ?? 'application/octet-stream'});

      // const mediaFile = MediaFile.fromFile(file as IMediaFile);
      const mediaFile = await DynamicMediaType.fromFile(file, url);
      console.log('mediaFile', file, mediaFile);
      return mediaFile;
    } catch (ex) {
      console.warn(ex);
    }
    return undefined;
  }
}
