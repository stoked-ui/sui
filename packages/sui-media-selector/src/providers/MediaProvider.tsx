import React, { useState, useContext, createContext, type ReactNode, ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import MediaData, { type IMediaData } from '../models/MediaData';
import { type IVideoFile, VideoFile } from '../models/VideoFile';
import PosterFile, { type IPosterFile } from '../models/PosterFile';
import MarkerFile, { type IMarkerFile } from '../models/MarkerFile';
import MediaFile, { type IMediaFile } from '../models/MediaFile';
import mime from 'mime';
import { IdGenerator } from '../services/IdGenerator';
import type { FileWithPath } from 'file-selector';
import { fromEvent } from 'file-selector';
import { FfmpegService } from '../services/Ffmpeg';
const { fileId } = IdGenerator();

export type VisibleFile = {
  file?: IMediaFile | null;
  index: number;
};

export interface IMediaContextType extends IMediaData {
  current: (visibleVideo?: VisibleFile | null) => IMediaFile | null;
  first: () => IMediaFile | null;
  addFiles: (files: FileWithPath[] | File[] | FileList) => Promise<void>;
  removeFile: (file: IMediaFile) => void;
  removeFiles: (files: IMediaFile[]) => void;
  updateFile: (file: IMediaFile) => void;
  aspectRatio: () => number | undefined;
}

class MediaContextType extends MediaData {
  visible: VisibleFile | null = null;
  constructor(props?: MediaContextType) {
    super(props);
  }
}

const MediaContext = createContext<IMediaContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useMediaFileContext = (): IMediaContextType => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useEditorFiles must be used within an EditorFileProvider');
  }
  return context;
};

interface MediaProviderProps {
  children: ReactNode;
}

type AddPromiseFunc = {
  promise: (file: MediaFile) => Promise<MediaFile>;
  array: MediaFile[];
  file: MediaFile;
};

/**
 * MediaProvider is a React component that provides the context for the Index.
 * It manages the state of the editor data and provides functions to manipulate that data.
 *
 * @component
 * @example
 * <MediaProvider>
 *   <ChildComponent />
 * </MediaProvider>
 */
const MediaProvider: React.FC<MediaProviderProps> = (props: MediaProviderProps) => {
  const { ffmpegTools, loaded } = FfmpegService();
  const [editorData, setEditorData] = useState<MediaContextType | null>(new MediaContextType());

  if (!loaded) {
    return <p>loading ffmpeg</p>;
  }
  /**
   * Returns the first video file in the editor data.
   *
   * @returns {IVideoFile | null} The first video file or null if none exist.
   */
  const first = (): IMediaFile | null => {
    if (editorData?.originals?.length) {
      return editorData.originals[0] || null;
    } else if (editorData?.finals?.length) {
      return editorData.finals[0] || null;
    }
    return null;
  };

  /**
   * Removes a file from the editor data.
   *
   * @param {IMediaFile} file The file to remove.
   */
  const removeFile = (file: IMediaFile): void => {
    //const newData = justData(editorData);
    if (file instanceof VideoFile) {
      if (editorData?.originals) {
        editorData.originals = editorData.originals.filter((f) => f !== file);
      }
      if (editorData?.finals) {
        editorData.finals = editorData.finals.filter((f) => f !== file);
      }
    } else if (file instanceof PosterFile && editorData?.poster === file) {
      editorData.poster = undefined;
    } else if (file instanceof MarkerFile) {
      if (editorData?.markers) {
        editorData.markers = editorData.markers.filter((f) => f !== file);
      }
    } else {
      if (editorData?.files) {
        editorData.files = editorData.files.filter((f) => f !== file);
      }
    }
    setEditorData({ visible: null, ...editorData });
  };

  const aspectRatio: () => number | undefined = () => {
    return editorData?.width && editorData?.height
      ? editorData.width / editorData.height
      : undefined;
  };
  /**
   * Removes multiple files from the editor data.
   *
   * @param {Array<MediaFile>} files The files to remove.
   */
  const removeFiles = (files: Array<MediaFile>): void => {
    files.forEach((f) => {
      removeFile(f);
    });
  };

  const updateSpecificType = (file: IMediaFile): MediaContextType | null => {
    const updatedFile = file;
    let index = -1;
    if (file instanceof VideoFile) {
      if (editorData?.originals) {
        index = editorData.originals.findIndex((f) => f.id === file.id);
        if (index !== -1) {
          editorData.originals[index] = updatedFile as IVideoFile;
          if (file?.width && file?.height) {
            if (editorData?.width && editorData?.height) {
              if (file.width * file.height > editorData.width * editorData.height) {
                editorData.width = file.width;
                editorData.height = file.height;
              }
            } else {
              editorData.width = file.width;
              editorData.height = file.height;
            }
          }
          return editorData;
        }
      }
      if (editorData?.finals) {
        index = editorData.finals.findIndex((f) => f.id === file.id);
        if (index !== -1) {
          editorData.finals[index] = updatedFile as IVideoFile;
          return editorData;
        }
      }
    } else if (file instanceof PosterFile && editorData?.poster?.id === file.id) {
      editorData.poster = updatedFile as IPosterFile;
    } else if (file instanceof MarkerFile) {
      if (editorData?.markers) {
        index = editorData.markers.findIndex((f) => f.id === file.id);
        if (index !== -1) {
          editorData.markers[index] = updatedFile as IMarkerFile;
          return editorData;
        }
      }
    } else {
      if (editorData?.files) {
        index = editorData.files.findIndex((f) => f.id === file.id);
        if (index !== -1) {
          editorData.files[index] = updatedFile;
          return editorData;
        }
      }
    }
    return editorData;
  };

  /**
   * Updates a file in the editor data.
   *
   * @param {IMediaFile} file The file to update.
   */
  const updateFile = (file: IMediaFile): void => {
    const newData = updateSpecificType(file);
    setEditorData({ visible: null, ...newData });
  };

  /**
   * Sets the current video file in the editor data.
   *
   * @param {IVideoFile | null} inputVideo The video file to set as current.
   * @returns {IVideoFile | null} The current video file.
   */
  const current = (inputVis: VisibleFile | null = null): IMediaFile | null => {
    const videoVis = inputVis;
    if (videoVis && editorData) {
      const curr = videoVis?.file || null;
      if (curr) {
        curr.visible = true;
        updateFile(curr);
      }
      const prev = editorData.visible?.file || null;
      if (prev && curr && prev.id !== curr.id) {
        prev.visible = false;
        updateFile(prev);
      }
      editorData.visible = videoVis;
      setEditorData({ ...editorData });
    }
    return editorData?.visible?.file || null;
  };

  async function initFiles(
    files: Array<FileWithPath>,
    updateFile: (file: IMediaFile) => void,
    posterExists: boolean,
  ): Promise<Array<MediaFile>> {
    let rveFiles = new Array<MediaFile>();
    const rveVideoPromises = new Array<Promise<VideoFile>>();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      let type: string | null = file.type;
      if (type === '') {
        type = mime.getType(file.name);
      }
      if (!type || type === '') {
        type = '';
        console.log('could not determine file type: ', file.name);
      }
      const primaryType: string | null = type.substring(0, type.indexOf('/'));
      if (primaryType === 'video') {
        const vidPromise = VideoFile.fromFile(file, (vid: IVideoFile) => {
          updateFile(vid);
        });
        rveVideoPromises.push(vidPromise);
      } else if (primaryType === 'image' && !posterExists) {
        const src = URL.createObjectURL(file);
        const poster = new PosterFile({
          src,
          ...file,
          id: fileId(),
          visible: false,
        });
        rveFiles.push(poster);
      } else {
        const newFile = new MediaFile({
          id: fileId(),
          file: file,
          src: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          modified: file.lastModified,
          visible: false,
        });
        rveFiles.push(newFile);
      }
    }
    await Promise.all(rveVideoPromises).then((videos) => {
      rveFiles = rveFiles.concat(videos);
    });
    return rveFiles;
  }

  /**
   * Adds a file to the editor data.
   *
   * @param {MediaFile} file The file to add.
   * @returns {Promise<MediaData>} The updated editor data.
   */
  async function addFile(file: MediaFile): Promise<MediaFile> {
    if (file instanceof VideoFile && file.file && ffmpegTools) {
      const video = file;
      // Generate a screenshot for the video file
      const timestamp = '00:00:01'; // Example timestamp, change as needed
      if (file.name && file.buffer) {
        video.poster = await ffmpegTools.createScreenshot(file, timestamp);
      }
    }
    return file;
  }

  const createPromise = (file: MediaFile, newData: MediaData): AddPromiseFunc => {
    if (file instanceof VideoFile) {
      if (newData.originals) {
        return { promise: addFile, array: newData.originals, file };
      } else if (newData.finals) {
        return { promise: addFile, array: newData.finals, file };
      }
    } else if (file instanceof MarkerFile && newData.markers) {
      return { promise: addFile, array: newData.markers, file };
    }
    return { promise: addFile, array: newData.files || [], file };
  };

  type AddedFiles = FileWithPath[];
  /**
   * Adds files to the editor data.
   *
   * @param {FileList} files The files to add.
   * @returns {Promise<void>}
   */
  const addFiles = async (
    files: File[] | FileWithPath[] | FileList | ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!editorData) {
      return;
    }

    //if (files as File[] || files as FileList) {
    const addedFiles = (await fromEvent(files)) as AddedFiles;
    const rveFiles = await initFiles(addedFiles, updateFile, editorData.poster !== undefined);
    const newData = new MediaData();
    const promiseArray = new Array<AddPromiseFunc>();
    for (const f of rveFiles) {
      if (f instanceof PosterFile) {
        newData.poster = f;
      } else {
        promiseArray.push(createPromise(f, newData));
      }
    }
    const results = await Promise.allSettled(
      promiseArray.map(async (prom) => {
        return prom?.promise(prom.file);
      }),
    );
    results.map((result, index) => {
      if (result.status === 'fulfilled') {
        promiseArray[index]?.array.push(result.value);
      }
    });

    newData.originals = editorData.originals
      ? newData.originals?.concat(editorData.originals)
      : newData.originals;
    newData.finals = editorData.finals
      ? newData.finals?.concat(editorData.finals)
      : editorData.finals;
    newData.markers = editorData.markers
      ? newData.markers?.concat(editorData.markers)
      : editorData.markers;
    newData.files = editorData.files ? newData.files?.concat(editorData.files) : editorData.files;

    setEditorData({ ...editorData, ...newData });
  };

  const outVal = {
    ...editorData,
    current,
    first,
    addFiles,
    removeFile,
    removeFiles,
    updateFile,
    aspectRatio,
  };

  return <MediaContext.Provider value={outVal}>{props.children}</MediaContext.Provider>;
};

MediaProvider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: PropTypes.node,
} as any;

export { MediaProvider };
