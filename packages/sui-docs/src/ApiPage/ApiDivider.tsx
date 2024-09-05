import * as React from 'react';
import MuiDivider from '@mui/material/Divider';

function Divider(): React.ReactElement {
  return (
    <MuiDivider
      sx={{
        borderBottomWidth: 2,
        borderBottomStyle: 'dashed',
        borderBottomColor: 'divider',
      }}
    />
  );
}

export default Divider;
