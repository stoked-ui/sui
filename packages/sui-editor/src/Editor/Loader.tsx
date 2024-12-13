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

const LoopVideo = styled('video', {
  name: "MuiEditorLoader",
  slot: "loop-video",
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

const LoaderCircle = styled('div', {
  name: "MuiEditorLoader",
  slot: "loading-indicator"
})(({ theme }) => ({
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
  const { state: context, dispatch } = useEditorContext();
  const { getState, engine, settings, flags, file } = context;
  const loopVideoRef = React.useRef<HTMLVideoElement>(null);
  const previewVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {

    if (loopVideoRef.current) {
      const element = loopVideoRef.current as HTMLVideoElement;
      if (element) {
        dispatch({
          type: 'SET_COMPONENT',
          payload: { key: 'loopVideo', value: element as HTMLVideoElement }
        });
      }
      const loopVideo = loopVideoRef.current as HTMLVideoElement;
      if (loopVideo) {

        loopVideo.oncanplay = () => {
          loopVideo.muted = true;
          loopVideo.loop = true;
          loopVideo.style.display = 'flex';
          loopVideo.play();
          // Set isVisible to true after a short delay to trigger the animation
          const timeout = setTimeout(() => {
            loopVideo.classList.add('show');
          }, 100);
        }
        // loopVideo.src = 'https://assets9.lottiefiles.com/packages/lf20_9yjzqz.json';
        loopVideo.src = '/static/editor/stock-loop.mp4';
      }
    }
  }, [loopVideoRef.current]);

  const [loadState, setLoadState] = React.useState<{ loading: boolean, preview: boolean }>({ loading: true, preview: false });
  React.useEffect(() => {
    const loading = getState() === EngineState.LOADING;
    setLoadState({
      preview: settings.disabled,
      loading
    });
  }, [engine.state, file, settings.disabled]);

  if (flags.detailMode) {
    return null;
  }

  if (loadState?.loading) {
    return (
      <React.Fragment>
        <LoopVideo role={'loading-video'} ref={loopVideoRef} styles={styles} />
        <LoaderCircle />
      </React.Fragment>
    )
  }

  if (loadState?.preview) {
    return (
      <React.Fragment>
        <LoopVideo role={'preview-video'} ref={loopVideoRef} styles={styles} />
      </React.Fragment>
    )
  }

  return <React.Fragment />
}

export default Loader;
