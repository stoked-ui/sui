import * as React from 'react';
import {TimelineState} from '@stoked-ui/timeline'

function VideoRecorder (props: { timelineState: React.RefObject<TimelineState> }) {
  const { timelineState } = props;

  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder>();
  const [mediaStream, setMediaStream] = React.useState<MediaStream>();
  const [recording, setRecording] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
  const [error, setError] = React.useState<string | null>(null);


  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  React.useEffect(() => {
    if (timelineState.current?.engine?.renderer  && !mediaStream) {
      const stream = timelineState.current?.engine?.renderer.captureStream(); // frames per second
      console.log('Started stream capture from canvas element: ', stream);
      setMediaStream(stream);
    }
  })

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data)
      setRecordedChunks([...recordedChunks]);
    }
  }

  function handleStop(event) {
    if (timelineState.current?.engine?.screener) {
      console.log('Recorder stopped: ', event);
      const superBuffer = new Blob(recordedChunks, {type: 'video/webm'});
      timelineState.current.engine.screener.src = window.URL.createObjectURL(superBuffer);
      timelineState.current.engine.screener.style.display = 'flex';
    }
  }

  function toggleRecording() {
    if (!recording) {
      startRecording();
    } else {
      stopRecording();
    }
  }

  // The nested try blocks will be simplified when Chrome 47 moves to Stable
  function startRecording() {
    if (!mediaStream) {
      return;
    }

    let options: any = {mimeType: 'video/webm'};
    setRecordedChunks([])
    let mediaRecorderB: MediaRecorder | null = null;
    try {
      mediaRecorderB = new MediaRecorder(mediaStream, {mimeType: 'video/mp4'});
    } catch (e0) {
      console.log('Unable to create MediaRecorder with options Object: ', e0);
      try {
        options = {mimeType: 'video/webm,codecs=vp9'};
        mediaRecorderB = new MediaRecorder(mediaStream, options);
      } catch (e1) {
        console.log('Unable to create MediaRecorder with options Object: ', e1);
        try {
          options = 'video/vp8'; // Chrome 47
          mediaRecorderB = new MediaRecorder(mediaStream, options);
        } catch (e2) {
          alert('MediaRecorder is not supported by this browser.\n\n' +
                'Try Firefox 29 or later, or Chrome 47 or later, ' +
                'with Enable experimental Web Platform features enabled from chrome://flags.');
          console.error('Exception while creating MediaRecorder:', e2);
          return;
        }
      }
    }
    setMediaRecorder(mediaRecorderB);
    setRecording(true);

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    mediaRecorderB.onstop = handleStop;
    mediaRecorderB.ondataavailable = handleDataAvailable;
    mediaRecorderB.start(100); // collect 100ms of data
    if (timelineState.current?.engine?.screener) {
      timelineState.current.engine.play({ autoEnd: true })
    }
    console.log('MediaRecorder started', mediaRecorder);
  }

  function stopRecording() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      console.log('Recorded Blobs: ', recordedChunks);
      setRecording(false);
    }
  }

  function download() {
    const blob = new Blob(recordedChunks, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  return (
    <div style={{width: '100%', height: '100%'}}>
      {/* Recording controls */}
      <div style={{marginTop: '10px'}}>
        <button type='button' onClick={toggleRecording} disabled={recording}>
          Start Recording
        </button>
        <button type='button' onClick={toggleRecording} disabled={!recording}>
          Stop Recording
        </button>
        <button type='button' onClick={download} disabled={recording}>
          Download
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
