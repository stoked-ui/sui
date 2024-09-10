import MediaFile from "../MediaFile";

// import { parseWebStream } from 'music-metadata';

interface WaveformOptions {
  width?: number;
  height?: number;
  backgroundColor: string;
  waveformColor: string;
  outputType?: 'dataurl' | 'blob';
}

export default class AudioFile extends MediaFile {
  offlineAudioContext: OfflineAudioContext | null = null;

  decodedData: AudioBuffer | null = null;

  static async getMetadata(file: MediaFile) {}

  static primaryColor = '#146b4e';

  static secondaryColor = '#2bd797';

  async createWaveFormImage(
    file: MediaFile,
    options: WaveformOptions
  ): Promise<string> {
    options.backgroundColor = AudioFile.primaryColor;
    options.waveformColor = AudioFile.secondaryColor;
    this.offlineAudioContext = new OfflineAudioContext(1, 44100 * 40, 44100);

    // Fetch the audio file from the URL using XMLHttpRequest
    this.decodedData = await this.decodeAudioData(await file.arrayBuffer());
    return this.getAudioBufferImage(options);
  }

  private decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> | null {

    return new Promise((resolve, reject) => {
      if (!this.offlineAudioContext) {
        const err = new Error(`Offline audio context not found.`);
        reject(err);
      } else {
        this.offlineAudioContext.decodeAudioData(arrayBuffer, buffer => resolve(buffer), error => {
          // console.log('Error decoding audio data:', error);
          // console.log('Audio data size:', arrayBuffer.byteLength);
          reject(new Error(`Error decoding audio data: ${error}`));
        });
      }
    });
  }

  private async getAudioBufferImage(options: WaveformOptions): Promise<string> {
    const canvas = document.createElement('canvas');
    const width = options.width || 800;
    const height = options.height || 400;
    canvas.width = width;
    canvas.height = height;
    const canvasContext = canvas.getContext('2d');

    if (!canvasContext) {
      throw new Error('Canvas context not found.');
    }

    if (!this.decodedData) {
      throw new Error('Decoded audio data not found.');
    }

    const waveform = this.decodedData.getChannelData(0);
    const samplesPerPixel = Math.floor(waveform.length / width);

    canvasContext.fillStyle = options.backgroundColor;
    canvasContext.fillRect(0, 0, width, height);

    canvasContext.strokeStyle = options.waveformColor;
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

    return canvas.toDataURL('image/png');
  }
}

