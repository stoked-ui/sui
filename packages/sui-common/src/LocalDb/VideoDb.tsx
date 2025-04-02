/**
 * Import required modules.
 */
import * as React from "react";
import GrokLoader from "../GrokLoader/GrokLoader";

/**
 * IndexedDB setup function.
 *
 * @returns A promise that resolves to the opened database object.
 */
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("VideoEditorDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      /**
       * Create a new object store for storing videos.
       */
      db.createObjectStore("videos", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Store video in IndexedDB function.
 *
 * @param db The database object to store the video in.
 * @param videoUrl The URL of the video file.
 * @param videoId The ID of the video.
 * @returns A promise that resolves to the stored video blob.
 */
export const storeVideo = async (db: IDBDatabase, videoUrl: string, videoId: string): Promise<Blob> => {
  /**
   * Fetch the video from the URL.
   */
  const response = await fetch(videoUrl);
  const blob = await response.blob();
  
  const tx = db.transaction("videos", "readwrite");
  const store = tx.objectStore("videos");
  store.put({ id: videoId, data: blob });
  
  // eslint-disable-next-line no-return-assign
  await new Promise((resolve) => {(tx.oncomplete = resolve)});
  return blob;
};

/**
 * Check if video exists and fetch if not function.
 *
 * @param db The database object to check for the video in.
 * @param videoUrl The URL of the video file.
 * @param videoId The ID of the video.
 * @returns A promise that resolves to the fetched video blob.
 */
export const getOrFetchVideo = async (db: IDBDatabase, videoUrl: string, videoId: string):Promise<Blob> => {
  const tx = db.transaction("videos", "readonly");
  const store = tx.objectStore("videos");
  const request = store.get(videoId);

  const videoData: Blob = await new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result?.data);
  });

  if (videoData) {
    return videoData; // Already in IndexedDB
  }
  return storeVideo(db, videoUrl, videoId); // Fetch and store
};

/**
 * Video Editor Component.
 *
 * @param props The component props.
 */
export default function VideoDb({ sceneVideos }) {
  /**
   * State variables to store the video sources and loading status.
   */
  const [videoSources, setVideoSources] = React.useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = React.useState(false);

  /**
   * Effect hook to load all videos for the scene when the component mounts or props change.
   */
  React.useEffect(() => {
    const loadVideos = async () => {
      const db = await openDB();
      const videoBlobs = {};

      // Load all videos for the scene
      await Promise.all(
        sceneVideos.map(async ({ url, id }) => {
          const blob = await getOrFetchVideo(db, url, id);
          videoBlobs[id] = URL.createObjectURL(blob);
        })
      );

      setVideoSources(videoBlobs);
      setIsLoaded(true);
    };

    loadVideos().catch(console.error);

    // Cleanup: Revoke object URLs when component unmounts
    return () => {
      Object.values(videoSources).forEach((value) => URL.revokeObjectURL(value));
    };
  }, [sceneVideos]);

  if (!isLoaded) {
    return <GrokLoader/>
  }

  return (
    <div>
      {sceneVideos.map(({ id, name }) => (
        <div key={id}>
          <h3>{name}</h3>
          <video
            controls
            src={videoSources[id]}
            onLoadedData={() => console.log(`${name} ready`)}
          />
        </div>
      ))}
      {/* Your scrubbing/timeline logic here */}
    </div>
  );
};