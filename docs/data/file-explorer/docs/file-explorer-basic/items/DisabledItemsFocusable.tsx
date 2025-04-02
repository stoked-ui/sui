import * as React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';

export default function DisabledItemsFocusable() {
  const [disabledItemsFocusable, setDisabledItemsFocusable] = React.useState(false);
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisabledItemsFocusable(event.target.checked);
  };

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Switch
            checked={disabledItemsFocusable}
            onChange={handleToggle}
            name="disabledItemsFocusable"
          />
        }
        label="Allow focusing disabled items"
      />
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorerBasic disabledItemsFocusable={disabledItemsFocusable}>
          <FileElement name={"Notes"}>
            <FileElement name="doc.pdf" />
            <FileElement name="notes.txt" />
          </FileElement>
          <FileElement name={"Images"}>
            <FileElement name={"logo.png"} />
            <FileElement name={"favicon.ico"} />
          </FileElement>
          <FileElement name={"Movies"}>
            <FileElement name={"feature.mp4"} />
          </FileElement>
          <FileElement name={"Data"}>
            <FileElement name={"client-data.xls"} />
          </FileElement>
        </FileExplorerBasic>
      </Box>
    </Stack>
  );
}

