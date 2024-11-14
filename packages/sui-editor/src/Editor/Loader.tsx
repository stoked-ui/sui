import * as React from 'react';
import { styled, keyframes } from '@mui/material/styles';
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
})({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 50,
  opacity: 0,
  transition: 'opacity 4s',
  '&.show': {
    opacity: 1,
  },
});

const LoaderCircle = styled('div')(({ theme }) => ({
  width: '25px',
  height: '25px',
  display: 'inline-block',
  'z-index': 51,
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
let count = 0;
function Loader() {
  const { editorId,dispatch, engine, components } = useEditorContext();
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

  if (engine?.isLoading) {

    return (
      <React.Fragment>
        <LoadingVideo role={'loading-video'} ref={loadingVideoRef} />
        <LoaderCircle />
      </React.Fragment>
    )
  }
  return <React.Fragment />
}

export default Loader;
