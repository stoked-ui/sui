import FileWithPath, {
  FILE_BASE_TYPES,
  FromEventInput, IFileWithPath,
} from "../FileWithPath";

export function mimeToMediaType(mime?: string) {
  if (!mime) {
    return 'file';
  }
  if (mime.startsWith('image')){
    return 'image';
  }
  if(mime.startsWith('video')) {
    return 'video';
  }
  const type = FILE_BASE_TYPES.get(mime);
  if (type) {
    return type;
  }
  return 'file';
}

export interface IMediaFile extends IFileWithPath {
  readonly mediaType: string;
}

export default class MediaFile extends FileWithPath implements IMediaFile {
  readonly path?: string;

  constructor(fileWithPath: IFileWithPath) {
    super(fileWithPath);
  }

  get mediaType() {
    const type = this.type;
    console.log('type', type);
    const mediaType = this.mediaType;
    console.log('mediaType', mediaType)
    const mediaTypeFunc = mimeToMediaType(type);
    console.log('mimeToMediaType', mediaTypeFunc)
    return mimeToMediaType(this.type);
  }

  static async from(input: FromEventInput | { source?: { items: unknown[] } }): Promise<MediaFile[]> {
    const files = await FileWithPath.from(input)
    return files.map((fileWithPath) => new MediaFile(fileWithPath));
  }

}
