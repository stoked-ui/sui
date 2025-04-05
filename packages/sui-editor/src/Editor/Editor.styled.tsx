import * as React from "react";
import { styled } from "@mui/material";
import { IMediaFile } from "@stoked-ui/media-selector";
import { IFileDetail } from "@stoked-ui/timeline";
import Plyr, { PlyrProps } from "plyr-react";
import Collapse from "@mui/material/Collapse";
import AudioPlayer from "./AudioPlayer";

/**
 * Styled Plyr component.
 * @description Custom styled Plyr component.
 * @param {PlyrProps} props - Plyr component props.
 * @returns {JSX.Element} JSX element representing the StyledPlyr component.
 */
const StyledPlyrBase = styled(Plyr)(({ theme }) => ({
  // Styles for the StyledPlyr component.
}));

/**
 * Styled Plyr component.
 * @param {PlyrProps} props - Plyr component props.
 * @returns {JSX.Element} JSX element representing the StyledPlyr component.
 */
export function StyledPlyr(props: PlyrProps) {
  return <Plyr {...props} />;
}

/**
 * Video Player component.
 * @param {{ file: IMediaFile | IFileDetail }} props - Video player props.
 * @returns {JSX.Element} JSX element representing the VideoPlayer component.
 */
export function VideoPlayer({ file }: { file: IMediaFile | IFileDetail }) {
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
  };

  React.useEffect(() => {
    return () => {
    };
  }, []);

  return <StyledPlyr source={plyrProps.source} options={{ controls: ['play', 'progress', 'mute', 'volume'] }} />;
}

/**
 * Media Screener component.
 * @param {{ file: IMediaFile | IFileDetail | undefined }} props - Media screener props.
 * @returns {JSX.Element} JSX element representing the MediaScreener component.
 */
export function MediaScreener(props: { file: IMediaFile | IFileDetail | undefined }) {
  const { file } = props;
  if (!file) {
    return undefined;
  }

  switch (file?.mediaType) {
    case 'video':
      return <VideoPlayer file={file} />;
    case 'audio':
      return <AudioPlayer file={file} />;
    case 'image':
      return <img src={file.url} alt={file.name} style={{ maxWidth: '100%' }} />;
    default:
      return <div>Media screener not available for [{file.mediaType}].</div>;
  }
}

const StyledCollapse = styled(Collapse, {
  name: 'MuiSlider',
  slot: 'Track',
})(({ theme }) => {
  return {
    // Styles for the StyledCollapse component.
  };
});

/**
 * Function to get modal style.
 * @returns {Object} Object representing the modal style.
 */
export function getModalStyle() {
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
}