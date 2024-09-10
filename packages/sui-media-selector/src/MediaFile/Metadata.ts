import VideoFile from "./Video/VideoFile";
import ImageFile from "./Image/ImageFile";
import AudioFile from "./Audio/AudioFile";
import AnimationFile from "./Animation/AnimationFile";

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
