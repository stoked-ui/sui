import * as React from 'react';
import { FileBase } from '@stoked-ui/file-explorer';
import { useSlotProps } from '@mui/base/utils';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { ViewSpaceProps } from './ViewSpace.types';
import composeClasses from "@mui/utils/composeClasses";
import { getViewSpaceUtilityClass } from "./viewSpaceClasses";
import ReactPlayer from 'react-player';

const useThemeProps = createUseThemeProps('MuiViewSpace');

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: ViewSpaceProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getViewSpaceUtilityClass, classes);
};

const ViewSpaceRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '& .player-panel': {
    width: '100%',
    height: '500px',
    position: 'relative',

    '& .lottie-ani': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
    }
  },
  overflow: 'hidden',
  minHeight: '400px'
}));

/**
 *
 * Demos:
 *
 * - [FileExplorer View](https://stoked-ui.github.io/video-editor/docs/)
 *
 * API:
 *
 * - [FileExplorer API](https://stoked-ui.github.io/video-editor/api/)
 */
export const ViewSpace = React.forwardRef(function ViewSpace<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>(inProps: ViewSpaceProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const props = useThemeProps({ props: inProps, name: 'MuiViewSpace' });

  const { slots, slotProps } = props;
  const classes = useUtilityClasses(props);

  const Root = slots?.root ?? ViewSpaceRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps?.root,
    className: classes.root,
    ownerState: props,
  });

  const url = '/static/video-editor/stock-loop.mp4';

  return (
    <div style={{ border: '1px solid black' }}>
      <ReactPlayer
        className="rve-player"
        width={'100%'}
        height={'100%'}
        style={{ border: '1px solid black', display: 'flex' }}
        url={'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
        /*
        onDuration={(duration: number) => {
          handleDuration(duration, video);
        }}
        */
      />
    </div>
  )
})

