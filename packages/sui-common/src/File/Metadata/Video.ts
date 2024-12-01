export async function extractVideoMetadata(
  file: File,
  screenshotOption: boolean | number
): Promise<{
  duration: number; // Video duration in seconds
  format: string;   // MIME type
  name: string;     // File name
  size: number;     // File size in bytes
  screenshots?: string[]; // Base64 strings of screenshots
}> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a video file.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file.'));
        return;
      }

      const video = document.createElement('video');
      video.src = URL.createObjectURL(new Blob([event.target.result], { type: file.type }));
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration, // Duration in seconds
          format: file.type,       // MIME type
          name: file.name,         // File name
          size: file.size,         // File size in bytes
        };

        if (!screenshotOption) {
          resolve(metadata);
          return;
        }

        // Generate screenshots
        const screenshots: string[] = [];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Failed to create canvas context.'));
          return;
        }

        const screenshotCount = typeof screenshotOption === 'number' ? screenshotOption : 1;
        const interval = video.duration / (screenshotCount + 1);

        const captureScreenshot = (time: number): Promise<void> =>
          new Promise((resolveCapture) => {
            video.currentTime = time;

            video.onseeked = () => {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              screenshots.push(canvas.toDataURL('image/jpeg'));
              resolveCapture();
            };
          });

        (async () => {
          for (let i = 1; i <= screenshotCount; i++) {
            const time = Math.min(video.duration, interval * i);
            await captureScreenshot(time);
          }
          resolve({ ...metadata, screenshots });
        })();
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
