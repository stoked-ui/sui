import VideoFile from "./VideoFile";
import ImageFile from "./ImageFile";
import AudioFile from "./AudioFile";
import AnimationFile from "./AnimationFile";

export default async function getMetadata (file: any) {
  switch (file.mediaType) {
    case 'audio':
      await AudioFile.getMetadata(file)
      break;
    case 'video':
      await VideoFile.getMetadata(file);
      break;
    case 'image':
      await ImageFile.getMetadata(file);
      break;
    case 'animation':
      await AnimationFile.getMetadata(file);
      break;
    default:
  }
}
