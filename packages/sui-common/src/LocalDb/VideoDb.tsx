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
  /**
   * Opens a new database connection with the specified name and version.
   */
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("VideoEditorDB", 1);
    /**
     * Handles the case where the database is upgraded or created.
     */
    request.onupgradeneeded = () => {
      const db = request.result;
      /**
       * Creates a new object store for storing videos.
       */
      db.createObjectStore("videos", { keyPath: "id" });
    };
    /**
     * Handles successful completion of the database open operation.
     */
    request.onsuccess = () => resolve(request.result);
    /**
     * Handles errors during database open operation.
     */
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
   * Fetches the video from the specified URL.
   */
  const response = await fetch(videoUrl);
  const blob = await response.blob();
  
  /**
   * Starts a transaction on the "videos" object store.
   */
  const tx = db.transaction("videos", "readwrite");
  /**
   * Gets a reference to the "videos" object store.
   */
  const store = tx.objectStore("videos");
  /**
   * Stores the video blob in the database.
   */
  store.put({ id: videoId, data: blob });
  
  /**
   * Waits for the transaction to complete before returning.
   */
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
  /**
   * Starts a transaction on the "videos" object store in read-only mode.
   */
  const tx = db.transaction("videos", "readonly");
  /**
   * Gets a reference to the "videos" object store.
   */
  const store = tx.objectStore("videos");
  /**
   * Retrieves a reference to the video with the specified ID.
   */
  const request = store.get(videoId);

  /**
   * Waits for the response and extracts the blob data if available.
   */
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
    /**
     * Loads the videos and updates the state on success or error.
     */
    const loadVideos = async () => {
      try {
        await loadVideosAsync();
        setIsLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };

    loadVideos().catch(console.error);

    /**
     * Cleanup: Revoke object URLs when component unmounts.
     */
    return () => {
      Object.values(videoSources).forEach((value) => URL.revokeObjectURL(value));
    };
  }, [sceneVideos]);

  if (!isLoaded) {
    return <GrokLoader/>
  }

  /**
   * Renders the video player with the loaded videos.
   */
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