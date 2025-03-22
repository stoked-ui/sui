import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function EditorModes() {
  const [mode, setMode] = React.useState('project');
  
  const handleModeChange = (event) => {
    setMode(event.target.value);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="editor-mode-label">Editor Mode</InputLabel>
          <Select
            labelId="editor-mode-label"
            id="editor-mode-select"
            value={mode}
            label="Editor Mode"
            onChange={handleModeChange}
          >
            <MenuItem value="project">Project Mode</MenuItem>
            <MenuItem value="track">Track Mode</MenuItem>
            <MenuItem value="action">Action Mode</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ height: '400px', width: '100%', border: '1px solid #e0e0e0' }}>
        <Editor 
          mode={mode}
          labels={true}
          fileView={true}
        />
      </Box>
    </Box>
  );
} 