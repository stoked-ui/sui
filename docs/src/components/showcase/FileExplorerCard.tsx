import * as React from 'react';
import Fade from '@mui/material/Fade';
import { Card } from '@mui/material';
import { alpha } from "@mui/material/styles";
import FileExplorerHero from "./FileExplorerHero";

export default function FileExplorerCard(props: any) {
  return (
    <Fade in timeout={700}>
      <Card
        data-mui-color-scheme="dark"
        sx={{
          minWidth: 280,
          maxWidth: '100%',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: (theme) => `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
        }}
      >
         <FileExplorerHero {...props} />
      </Card>
    </Fade>
  );
}
