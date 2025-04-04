/**
 * A React component that displays a loading video and animation.
 *
 * @author [Your Name]
 */

import * as React from 'react';
import { styled, keyframes } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import {EngineState, FileState} from '@stoked-ui/timeline';
import {useEditorContext} from "../EditorProvider/EditorContext";

/**
 * A keyframe animation that scales the loader circle from 0 to 1.
 */
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

/**
 * A styled video component that loops and displays a loading animation.
 *
 * @param {object} styles - The CSS properties for the component.
 */
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

/**
 * A styled loader circle that rotates and animates.
 *
 * @param {object} props - The component props.
 */
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

/**
 * A React component that displays a loading video and animation.
 *
 * @param {object} props - The component props.
 */
function Loader({styles}: {styles: React.CSSProperties}) {
  /**
   * Gets the state and dispatch function from the editor context.
   */
  const { state: context, dispatch } = useEditorContext();
  
  /**
   * Destructures the state and other values from the context.
   */
  const { getState, engine, settings, flags, file } = context;
  
  /**
   * References for the loop video and preview video elements.
   */
  const loopVideoRef = React.useRef<HTMLVideoElement>(null);
  const previewVideoRef = React.useRef<HTMLVideoElement>(null);

  /**
   * Effect to handle the loading state change.
   */
  React.useEffect(() => {
    if (loopVideoRef.current) {
      // Handle the loading state change
      const loading = getState() === EngineState.LOADING;
      
      // Set the load state based on the loading flag and preview setting
      setLoadState({
        preview: settings.disabled,
        loading
      });
    }
  }, [engine.state, file, settings.disabled]);

  /**
   * Sets the load state.
   */
  const [loadState, setLoadState] = React.useState<{ loading: boolean, preview: boolean }>({ loading: true, preview: false });

  /**
   * Renders the component based on the load state.
   */
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