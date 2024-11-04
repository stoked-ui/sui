interface WaveformOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  waveformColor?: string;
  outputType?: 'dataurl' | 'blob';
}

function generateWaveformImage(
  audioSource: File | string,
  options: WaveformOptions = {}
): Promise<string> {
  const offlineAudioContext = new OfflineAudioContext(1, 44100 * 40, 44100);

  if (typeof audioSource === 'string') {
    // Fetch the audio file from the URL using XMLHttpRequest
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      console.log('audioSource', audioSource)
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
        // console.log('Error decoding audio data:', error);
        // console.log('Audio data size:', (e.target?.result as ArrayBuffer).byteLength);
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
      buffer => resolve(buffer),
      error => {
        // console.log('Error decoding audio data:', error);
        // console.log('Audio data size:', arrayBuffer.byteLength);
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
  for (let i = 0; i < width; i += 1) {
    const start = i * samplesPerPixel;
    const end = start + samplesPerPixel;
    const min = Math.min(...waveform.slice(start, end));
    const max = Math.max(...waveform.slice(start, end));

    const yMin = halfHeight + min * halfHeight;
    const yMax = halfHeight + max * halfHeight;

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

export default generateWaveformImage;
