import {Howl} from "howler";

export interface IAudioMetadata {
  duration: number;
  format: string;
  name: string;
  size: number;
  artist?: string;
  trackTitle?: string;
}

export async function extractAudioMetadata(file: File): Promise<IAudioMetadata> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('audio/')) {
      reject(new Error('File is not an audio file.'));
      return;
    }

    const audioContext = new AudioContext();
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file.'));
          return;
        }

        const arrayBuffer = event.target.result as ArrayBuffer;

        // Decode the audio data to extract metadata
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Basic metadata extraction
        const metadata = {
          duration: audioBuffer.duration, // Duration in seconds
          format: file.type, // MIME type
          name: file.name, // File name
          size: file.size, // File size in bytes
        };

        // Attempt to extract additional metadata (artist/title from file name or ID3 tags if supported)
        const additionalMetadata = extractMetadataFromAudioFileName(file.name);

        resolve({ ...metadata, ...additionalMetadata });
      } catch (error) {
        reject(error);
      } finally {
        audioContext.close();
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Helper function to extract basic metadata from file name
export function extractMetadataFromAudioFileName(fileName: string): {
  artist?: string;
  trackTitle?: string;
} {
  const parts = fileName.split('-').map((part) => part.trim());
  if (parts.length === 2) {
    return {
      artist: parts[0],
      trackTitle: parts[1].replace(/\.\w+$/, ''), // Remove file extension
    };
  }
  return { trackTitle: fileName.replace(/\.\w+$/, '') };
}

export interface IAudioPreloadResult {
  element: HTMLAudioElement,
  objectUrl: string,
  metadata: IAudioMetadata,
}

export async function preloadAudio(file: File): Promise<IAudioPreloadResult> {
  if (!file.type.startsWith('audio/')) {
    throw new Error('File is not an audio file.');
  }

  // Create a new audio element

  // Create a Blob URL for the file
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const element = document.createElement('audio') as HTMLAudioElement;
    document.body.appendChild(element);
    console.info('bye bye bye')
    element.addEventListener("durationchange", () => {
      console.info("Audio duration:", element.duration); // Outputs the duration in seconds
      resolve( { element, objectUrl, metadata: { duration: element.duration, format: file.type, name: file.name, size: file.size }});
    });
    console.info('hi hi hi hi hi hi')
    element.src = objectUrl;
    // Set up the audio element
    element.preload = 'metadata'; // Ensures the audio is preloaded
  })
}

interface WaveformOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  waveformColor?: string;
  outputType?: 'dataurl' | 'blob';
}

export function generateWaveformImage(
  audioSource: File | string,
  options: WaveformOptions = {}
): Promise<string> {
  const offlineAudioContext = new OfflineAudioContext(1, 44100 * 40, 44100);


  if (typeof audioSource === 'string') {
    // Fetch the audio file from the URL using XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', audioSource, true);
      xhr.responseType = 'arraybuffer';

      xhr.onload = async function onLoad() {
        if (xhr.status === 200) {
          try {
            if (xhr.response.byteLength === 0) {
              throw new Error('Fetched audio data is empty.');
            }
            const contentType = xhr.getResponseHeader('Content-Type');
            if (!contentType || !contentType.startsWith('audio/')) {
              throw new Error(`Invalid audio data type: ${contentType}`);
            }
            // console.log('Fetched audio data size:', xhr.response.byteLength);
            // console.log('Fetched audio data type:', contentType);
            const decodedData = await decodeAudioData(offlineAudioContext, xhr.response);
            const result = await processAudioBuffer(decodedData, options);
            resolve(result);
          } catch (error) {
            // console.log('Error decoding audio data:', error);
            // console.log('Audio data size:', xhr.response.byteLength);
            reject(error);
          }
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      };

      xhr.onerror = function onError() {
        reject(new Error('Network error occurred'));
      };

      xhr.send();
    });
  }

  // Read the local file as an ArrayBuffer
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer.byteLength === 0) {
          throw new Error('Read audio data is empty.');
        }
        // console.log('Read audio data size:', arrayBuffer.byteLength);
        const decodedData = await decodeAudioData(offlineAudioContext, arrayBuffer);
        const result = await processAudioBuffer(decodedData, options);
        resolve(result);
      } catch (error) {
        console.info('Audio data size:', (e.target?.result as ArrayBuffer).byteLength);
        console.error('Error decoding audio data:', error);
        reject(error);
      }
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(audioSource);
  });
}

function decodeAudioData(context: OfflineAudioContext, arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    context.decodeAudioData(
      arrayBuffer,
      buffer => {
        resolve(buffer);
      },
      error => {
        console.info('Audio data size:', arrayBuffer.byteLength);
        console.error('Error decoding audio data:', error);
        reject(new Error(`Error decoding audio data: ${error}`));
      }
    );
  });
}

function processAudioBuffer(audioBuffer: AudioBuffer, options: WaveformOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = options.width || 800;
  const height = options.height || 400;
  canvas.width = width;
  canvas.height = height;
  const canvasContext = canvas.getContext('2d');
  if (!canvasContext) {
    throw new Error('Canvas context not found.');
  }

  const waveform = audioBuffer.getChannelData(0);
  const samplesPerPixel = Math.floor(waveform.length / width);

  canvasContext.fillStyle = options.backgroundColor || '#FFFFFF';
  canvasContext.fillRect(0, 0, width, height);

  canvasContext.strokeStyle = options.waveformColor || '#0000FF';
  canvasContext.lineWidth = 2;
  canvasContext.beginPath();

  const halfHeight = height / 2;
  let maxY = 0;
  let minY = 0;
  let total = 0;
  const plots: [number, number][] = [];
  for (let i = 0; i < width; i += 1) {
    const start = i * samplesPerPixel;
    const end = start + samplesPerPixel;
    const min = Math.min(...waveform.slice(start, end));
    const max = Math.max(...waveform.slice(start, end));
    plots.push([min, max]);
    if (min < minY) {
      minY = min;
    }
    if (max > maxY) {
      maxY = max;
    }
    const totalMax = (min * halfHeight) + (max * halfHeight);
    if (totalMax > total) {
      total = totalMax;
    }
  }

  const modifier = (300 / (total) - 1) * .5;
  for (let i = 0; i < width; i += 1) {
    const min = plots[i][0];
    const max = plots[i][1];


    const yMin = halfHeight + min * halfHeight * modifier;
    const yMax = halfHeight + max * halfHeight * modifier;

    canvasContext.moveTo(i, yMin);
    canvasContext.lineTo(i, yMax);
  }
  canvasContext.stroke();

  if (options.outputType === 'blob') {
    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          resolve(blobUrl);
        }
      }, 'image/png');
    });
  }

  return Promise.resolve(canvas.toDataURL('image/png'));
}

export interface IAudioWaveImageOptions {
  width: number;
  height: number;
  objectUrl: string;
  duration: number;
  waveformColor: string;
  backgroundColor: string;
}

export async function getAudioWaveImage (imageOptions: IAudioWaveImageOptions) {
  if (!imageOptions.duration) {
    throw new Error('attempting to generate a wave image for an audio file and the duration was not supplied')
  }
  const width = imageOptions.duration * 100;
  const blobUrl = await generateWaveformImage(imageOptions.objectUrl as string, {
    width, height: 300, backgroundColor: imageOptions.backgroundColor, // Black
    waveformColor: imageOptions.waveformColor,   // Green waveform
    outputType: 'blob'          // Output a Blob URL
  })
  return `url(${blobUrl})`;
}

export interface IAudioPreloadExtractResult {
  element: HTMLAudioElement,
  objectUrl: string,
  metadata: IAudioMetadata,
  waveformImageUrl: string,
}

export async function preloadExtractAudio(file: File): Promise<IAudioPreloadExtractResult> {
  const preloadRes = await preloadAudio(file);
  const { metadata, objectUrl } = preloadRes;

  const imageOptions = {
    width: metadata.duration * 100,
    height: 300,
    objectUrl,
    duration: metadata.duration,
    backgroundColor: '#0000',
    waveformColor:  '#2bd797'
  }
  const waveformImageUrl = await getAudioWaveImage(imageOptions);
  return { ...preloadRes, waveformImageUrl };
}
