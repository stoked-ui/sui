import * as React from 'react';
import Editor, { Controllers, EditorProvider } from '@stoked-ui/editor';
import Fade from "@mui/material/Fade";
import {Card} from "@mui/material";
import {alpha} from "@mui/material/styles";
import {SxProps} from "@mui/system";
import EditorExample from './EditorExample';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;


export default function EditorHero({ id, sx }: { id: string, sx?: SxProps}) {
  return (
    <Fade in timeout={700}>
      <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
      <Card
        sx={[(theme) => ({
          minWidth: 280,
          maxWidth: '100%',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
        }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <EditorProvider id={id} controllers={Controllers} >
          <Editor
            sx={sx || { borderRadius: '12px 12px 0 0' }}
            trackControls
            snapControls
            labels
            fileView
            openSaveControls
            file={EditorExample} />
        </EditorProvider>
      </Card>
      </div>
    </Fade>
  );
}

// file={EditorExample}

