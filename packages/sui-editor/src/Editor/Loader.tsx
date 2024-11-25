import * as React from 'react';
import { styled, keyframes } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import {EngineState, FileState} from '@stoked-ui/timeline';
import {useEditorContext} from "../EditorProvider/EditorContext";

const scale = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(0.7);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const LoadingVideo = styled('video', {
  name: "MuiEditorViewLoadingVideo",
  slot: "loading-video",
  shouldForwardProp: (prop) => prop !== 'viewMode',
})<{ styles: React.CSSProperties }>(({ theme, styles }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  zIndex: 50,
  opacity: 0,
  transition: 'opacity 4s',
  '&.show': {
    opacity: 1,
  },
}));

const LoaderCircle = styled('div')(({ theme }) => ({
  width: '25px',
  height: '25px',
  display: 'inline-block',
  zIndex: 51,
  bottom: 0,
  position: 'absolute',
  margin: '24px',

  '&::before, &::after': {
    content: '""',
    display: 'block',
    position: 'absolute',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderRadius: '50%',
    width: '25px',
    height: '25px',
    top: 0,
    left: 0,
  },
  '&::before': {
    animation: `${scale} 1s linear 0s infinite`,
    borderColor: theme.palette.text.primary,
  },
  '&::after': {
    opacity: 0,
    animation: `${scale} 1s linear 0.5s infinite`,
    borderColor: theme.palette.primary.main,
  },
}));

function Loader({styles}: {styles: React.CSSProperties}) {
  const { dispatch, file , engine, getState } = useEditorContext();
  const loadingVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {

    if (loadingVideoRef.current) {
      const element = loadingVideoRef.current as HTMLVideoElement;
      if (element) {
        dispatch({
          type: 'SET_COMPONENT',
          payload: { key: 'loadingVideo', value: element as HTMLVideoElement }
        });
      }
      const loadingVideo = loadingVideoRef.current as HTMLVideoElement;
      if (loadingVideo) {

        loadingVideo.oncanplay = () => {
          loadingVideo.muted = true;
          loadingVideo.loop = true;
          loadingVideo.style.display = 'flex';
          loadingVideo.play();
          // Set isVisible to true after a short delay to trigger the animation
          const timeout = setTimeout(() => {
            loadingVideo.classList.add('show');
          }, 100);
        }
        // loadingVideo.src = 'https://assets9.lottiefiles.com/packages/lf20_9yjzqz.json';
        loadingVideo.src = '/static/editor/stock-loop.mp4';
      }
    }
  }, [loadingVideoRef.current]);

  React.useEffect(() => {
  }, [file?.state]);

  if (getState() === EngineState.LOADING) {

    return (
      <React.Fragment>
        <LoadingVideo role={'loading-video'} ref={loadingVideoRef} styles={styles} />
        <LoaderCircle />
      </React.Fragment>
    )
  }

  return <React.Fragment />
}

export default Loader;
