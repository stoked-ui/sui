import * as React from 'react';
import Player from 'lottie-react';
import { Popover, Typography, Box } from '@mui/material';
import {FileDetailProps} from "./FileDetail.types";

function FileDetail({ file, anchorEl, onClose }: FileDetailProps) {
  const open = Boolean(anchorEl);

  const renderMediaContent = () => {
    switch (file.mediaType) {
      case 'video':
        return (
          <div>
            <video src={file.url} controls style={{ width: '100%' }} />
            <Typography variant="body2">Duration: {file.duration} seconds</Typography>
          </div>
        );
      case 'audio':
        return (
          <div>
            <audio src={file.url} controls />
            <Typography variant="body2">Duration: {file.duration} seconds</Typography>
          </div>
        );
      case 'image':
        return (
          <div>
            <img src={file.url} alt={file.name} style={{ maxWidth: '100%' }} />
            <Typography variant="body2">Resolution: {file.size} bytes</Typography>
          </div>
        );
      case 'lottie':
        return (
          <div>
            <Player src={file.url} loop autoplay animationData={undefined} />
            <Typography variant="body2">Lottie Animation</Typography>
          </div>
        );
      default:
        return <Typography>No preview available</Typography>;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box p={2}>
        <Typography variant="h6">{file.name}</Typography>
        <Typography variant="body2">Type: {file.mediaType}</Typography>
        <Typography variant="body2">Size: {file.size} bytes</Typography>
        {renderMediaContent()}
      </Box>
    </Popover>
  );
};

export default FileDetail;
