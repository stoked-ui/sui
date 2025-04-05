/**
 * React component for displaying a loader animation.
 * @param {object} props - The props for the Loader component.
 * @param {React.CSSProperties} props.styles - The CSS styles for the loader.
 * @returns {JSX.Element} React component that renders the loader.
 */
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
