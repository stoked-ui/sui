import * as React from 'react';
import PropTypes from 'prop-types';
import { IMediaFile } from '@stoked-ui/media-selector';
import composeClasses from '@mui/utils/composeClasses';
import {Fade} from "@mui/material";
import { useSlotProps } from '@mui/base/utils';
import { keyframes } from '@emotion/react';
import useForkRef from '@mui/utils/useForkRef';
import { createUseThemeProps, styled } from '../internals/zero-styled';
import { EditorViewProps } from './EditorView.types';
import { getEditorViewUtilityClass } from './editorViewClasses';
import { useEditorContext } from '../EditorProvider/EditorContext';
import Loader from '../Editor/Loader';
import EditorViewActions from "./EditorViewActions";

const useThemeProps = createUseThemeProps('MuiEditorView');

const useUtilityClasses = <R extends IMediaFile, Multiple extends boolean | undefined>(
  ownerState: EditorViewProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };
  return composeClasses(slots, getEditorViewUtilityClass, classes);
};

const EditorViewRoot = styled('div', {
  name: 'MuiEditorView',
  slot: 'root',
  shouldForwardProp: (prop) =>
    prop !== 'ownerState' &&
    prop !== 'viewButtons' &&
    prop !== 'fullscreen' &&
    prop !== 'viewButtonAppear' &&
    prop !== 'viewButtonExit' &&
    prop !== 'viewButtonEnter' &&
    prop !== 'fileUrl' &&
    prop !== 'fileView' &&
    prop !== 'detailMode' &&
    prop !== 'editorId'
})<{ loading: boolean }>(({ loading }) => {
  const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;
  const anim = `2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) 0s infinite normal none running ${spin}`;
  return {
    gridArea: 'viewer',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '100vw',
    aspectRatio: 16 / 9,
    '& .lottie-canvas': {
      width: '1920px!important',
      height: '1080px!important',
    },
    '& #settings': {
      alignSelf: 'bottom',
    },
  };
});

const Renderer = styled('canvas', {
  name: 'MuiEditorViewRenderer',
  slot: 'renderer',
  shouldForwardProp: (prop) =>
    prop !== 'viewMode' &&
  prop !== 'detailMode',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  width: '100%',
  height: '100%',
  minWidth: '480px',
  backgroundColor: theme.palette.background.default,
}));

const Screener = styled('video', {
  name: 'MuiEditorViewScreener',
  slot: 'screener',
  shouldForwardProp: (prop) => prop !== 'viewMode',
})({
  display: 'none',
  flexDirection: 'column',
  width: '100%',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 50,
});

const Stage = styled('div', {
  shouldForwardProp: (prop) => prop !== 'viewMode',
})(() => ({
  display: 'none',
  flexDirection: 'column',
  width: 'fit-content',
  position: 'absolute',
  left: 0,
  overflow: 'hidden',
  aspectRatio: 16 / 9,
  zIndex: 100,
}));


const EditorView = React.forwardRef(function EditorView<
  R extends IMediaFile = IMediaFile,
  Multiple extends boolean | undefined = undefined,
>(inProps: EditorViewProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const {state, dispatch} = useEditorContext();
  const { settings, file, engine, flags } = state;
  const props = useThemeProps({ props: inProps, name: 'MuiEditorView' });
  const viewRef = React.useRef<HTMLDivElement>(null);
  const combinedViewRef = useForkRef(ref, viewRef);
  const { editorId } = props;

  const [, setViewerSize] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const rendererRef = React.useRef<HTMLCanvasElement>(null);
  const screenerRef = React.useRef<HTMLVideoElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (engine && viewRef?.current) {
      engine.viewer = viewRef.current;
      if (viewRef.current.parentElement && settings) {
        viewRef.current.id = `viewer-${editorId}`;
        viewRef.current.classList.add(editorId);
      }
    }
  }, [viewRef, engine]);

  // tie the renderer to the editor
  React.useEffect(() => {
    if (rendererRef.current && viewRef.current) {
      if (!rendererRef.current.id && viewRef.current.parentElement && settings) {
        rendererRef.current.id = `renderer-${editorId}`;
        rendererRef.current.classList.add(editorId);
      }
    }
  });

  // tie the renderer to the editor
  React.useEffect(() => {
    if (screenerRef.current && viewRef.current) {
      if (!screenerRef.current.id && viewRef.current.parentElement && settings) {
        screenerRef.current.id = `screener-${editorId}`;
        screenerRef.current.classList.add(editorId);
      }
    }
  });

  // tie the renderer to the editor
  React.useEffect(() => {
    if (stageRef.current) {
      // ShadowStage.setStage(stageRef.current);
    }
    if (stageRef.current && viewRef.current) {
      if (!stageRef.current.id && viewRef.current.parentElement && settings) {
        stageRef.current.id = `stage-${editorId}`;
        stageRef.current.classList.add(editorId);
      }
    }
  }, [stageRef.current]);

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? EditorViewRoot;
  let rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: { ...props },
  });

  // if the viewer resizes make the renderer match it
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.target === viewerRef.current) {
          setViewerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
          if (rendererRef.current) {
            rendererRef.current.width = entry.contentRect.width;
            rendererRef.current.height = entry.contentRect.height;
            rendererRef.current.style.top = `-${rendererRef.current.height}px`;
          }
        }
      }
    });
    return () => {
      resizeObserver.disconnect();
    };
  }, [viewerRef]);


  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    width: '100%',
    height: '100%',
  };

  rootProps = { ...rootProps, ...rootProps.ownerState };
  return (
    <Root
      role={'viewer'}
      {...rootProps }
      ref={combinedViewRef}
      data-preserve-aspect-ratio
      onMouseEnter={() => {
        dispatch({ type: 'SET_FLAGS', payload: { add: ['showViewControls'] }});
      }}
      onMouseLeave={() => {
        dispatch({ type: 'SET_FLAGS', payload: { remove: ['showViewControls'] }});
      }}
    >
      {inProps.viewButtons?.map((button, index) => {
        return (
          <Fade
            timeout={{
              appear: inProps.viewButtonAppear,
              enter: inProps.viewButtonEnter,
              exit: inProps.viewButtonExit
            }}
            in={flags.showViewControls}
            key={`key-${index}`}
          >
            {button}
          </Fade>
        )
      })}
      {inProps.children}
      <Renderer
        role={'renderer'}
        style={{ backgroundColor: file?.backgroundColor }}
        ref={rendererRef}
        data-preserve-aspect-ratio
      />
      <Screener role={'screener'} ref={screenerRef} />
      <Loader styles={styles} />
      <Stage role={'stage'} ref={stageRef} />
      <EditorViewActions visible={flags.showViewControls}/>
    </Root>
  );
});

EditorView.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export default EditorView;
