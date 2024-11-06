import { Popover, styled} from "@mui/material";
import { IMediaFile } from "@stoked-ui/media-selector";
import Plyr, {PlyrProps} from "plyr-react";
import * as React from "react";
import AudioPlayer from "./AudioPlayer";
import Collapse from "@mui/material/Collapse";
import { useEditorContext } from "../EditorProvider";
import { IDetailFile } from "../DetailView";

export type PlayerProps = PlyrProps;

export const EditorPopover = React.forwardRef(function EditorPopover(
  props: { name: string, children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>,
) {
  const { children } = props;
  const context = useEditorContext();

  const onClose = (event, reason) => {
    context.dispatch({ type: 'SET_POPOVER', payload: { open: false, name: props.name } });
  }
  return (
    <Popover
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      ref={ref}
      open={context.popovers[props.name]}
      onClose={onClose}
      anchorReference={'none'}
    >
      {children}
    </Popover>
  )
});

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
    color: theme.palette.secondary.main
  },
  '&  .plyr--video .plyr__control.plyr__tab-focus, .plyr--video.plyr__control[aria-expanded=true]': {
    background: theme.palette.secondary.main,
  },
  '& .plyr__control .plyr__tab-focus': {
    boxShadow: '0 0 0 5px #FFF',
  },
  '& .plyr__menu__container': {
    background: 'hsl(210, 14%, 7%)',
  },
  '& .plyr--audio .plyr__controls': {
    background: 'hsl(210, 14%, 7%)',
    borderRadius: '6px'
  },
  '& .plyr__controls__item.plyr__time--current, .plyr__controls__item.plyr__time--duration.plyr__time': {
    color: '#FFF'
  },
  '& .MuiFormLabel-root.MuiInputLabel-root': {
    color: theme.palette.text.primary,
    padding: '3px 8px',
    borderRadius: '6px',
    background: theme.palette.background.default
  }
}));

export function StyledPlyr(props: PlayerProps) {

  return <Plyr {...props} />
}

export function VideoPlayer({file}: {file: IMediaFile | IDetailFile}){
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

export function MediaScreener(props: { file: IMediaFile | IDetailFile | undefined }) {
  const { file } = props;
  if (!file) {
    return undefined;
  }
  switch (file?.mediaType) {
    case 'video':
      return<VideoPlayer file={file}/>
    case 'audio':
      return <AudioPlayer file={file}/>
    case 'image':
      return <img src={file.url} alt={file.name} style={{maxWidth: '100%'}}/>
    default:
      return <div>Media screener not available for [{file.mediaType}].</div>;
  }
}


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
