import * as React from "react";
import { styled } from "@mui/material";
import { IMediaFile } from "@stoked-ui/media-selector";
import { type IFileDetail } from "@stoked-ui/timeline";
import Plyr, {PlyrProps} from "plyr-react";
import Collapse from "@mui/material/Collapse";
import AudioPlayer from "./AudioPlayer";

/**
 * Props for the Player component.
 */
export type PlayerProps = PlyrProps;

/**
 * Styled base component for the Plyr player.
 *
 * @param theme - The Material UI theme object.
 */
const StyledPlyrBase = styled(Plyr)(({theme}) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.background.default,
    borderRadius: '4px'
  },
  '& video, audio': {
    borderRadius: '6px'
  },
  '& .MuiChip-root': {
    backgroundColor: theme.palette.background.paper
  },
  '& .MuiChip-avatar': {
    backgroundColor: theme.palette.background.default
  },
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'red',
    color: 'white'
  },
  '& .disabledForm input': {
    'WebkitTextFillColor': theme.palette.text.primary
  },
  '& .disabledForm .MuiSelect-select': {
    'WebkitTextFillColor': theme.palette.text.primary
  },
  '& .disabledForm textarea': {
    'WebkitTextFillColor': theme.palette.text.primary
  },
  '& .disabledForm fieldset': {
    display: 'none'
  },
  '& input[disabled]': {
    pointerEvents: 'none'
  },
  '& textarea[disabled]': {
    pointerEvents: 'none'
  },
  /*
   background-color: hsl(210, 14%, 22%);
   border-color: hsl(210, 14%, 36%);
   color: hsl(215, 15%, 92%);
   outline-color: hsl(210, 100%, 45%);
   */
  '& .plyr.plyr--full-ui.plyr--video':{
    borderRadius: '6px'
  },
  '& .plyr--full-ui input[type=range]': {
    color: theme.palette.primary.main,
  },
  '& .plyr__control--overlaid': {
    background: theme.palette.primary.main,
  },
  '& .plyr--audio .plyr__control': {
    color: theme.palette.background.default,
  },
  '& .plyr--audio .plyr__control:hover': {
    background: theme.palette.primary.main,
    color: theme.palette.primary[700],
  },
}));

/**
 * The Player component.
 *
 * @param props - The component props.
 */
export function StyledPlyr(props: PlayerProps) {
  return <Plyr {...props} />
}

/**
 * A video player component that uses the Plyr library.
 *
 * @param {IMediaFile | IFileDetail} file - The media file or detail object.
 */
export function VideoPlayer({file}: {file: IMediaFile | IFileDetail}) {
  /**
   * Props for the Plyr source component.
   */
  const plyrProps: PlyrProps = {
    source: {
      type: 'video',
      title: file.name,
      sources: [
        {
          src: file.url,
        },
      ],
    },
  }

  React.useEffect(() => {
    return () => {
    }
  }, [])
  return <StyledPlyr source={plyrProps.source} options={{controls: ['play', 'progress', 'mute', 'volume']}} />
}

/**
 * A media screener component that displays different types of media.
 *
 * @param {IMediaFile | IFileDetail | undefined} props - The component props.
 */
export function MediaScreener(props: { file: IMediaFile | IFileDetail | undefined }) {
  const { file } = props;
  if (!file) {
    return undefined;
  }
  switch (file?.mediaType) {
    case 'video':
      return <VideoPlayer file={file}/>
    case 'audio':
      return <AudioPlayer file={file}/>
    case 'image':
      return <img src={file.url} alt={file.name} style={{maxWidth: '100%'}}/>
    default:
      return <div>Media screener not available for [{file.mediaType}].</div>;
  }
}

/**
 * A styled collapse component.
 *
 * @param theme - The Material UI theme object.
 */
const StyledCollapse = styled(Collapse, {
  name: 'MuiSlider',
  slot: 'Track',
})(({ theme }) => {
  return {
    position: 'relative',
    marginLeft: theme.spacing(1.5),
    borderLeftWidth: '2px',
    borderLeftStyle: 'solid',
    borderColor: theme.palette.grey[100],
    ...theme.applyStyles('dark', {
      borderColor: theme.palette.primary[700],
    }),
  };
});

/**
 * Returns the modal style.
 *
 * @returns The modal style object.
 */
export function getModalStyle() {
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
}