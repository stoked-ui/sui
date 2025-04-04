import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/**
 * CustomEditor component
 * 
 * A custom editor component that allows users to switch between different modes and edit files.
 */
export default function CustomEditor() {
  /**
   * Editor configuration state
   * 
   * The current mode of the editor, including minimal, fullscreen, detailMode, and mode.
   */
  const [editorConfig, setEditorConfig] = React.useState({
    minimal: false,
    fullscreen: false,
    detailMode: false,
    mode: 'project',
  });
  
  /**
   * Handles changes to the editor configuration
   * 
   * Updates the editorConfig state with the new config.
   * @param {Object} config - The new configuration object.
   */
  const handleConfigChange = (config) => {
    setEditorConfig((prev) => ({
      ...prev,
      ...config
    }));
  };
  
  return (
    <Box sx={{ height: '600px', width: '100%', border: '1px solid #e0e0e0' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant={editorConfig.minimal ? 'contained' : 'outlined'} 
          onClick={() => handleConfigChange({ minimal: !editorConfig.minimal })}
        >
          {editorConfig.minimal ? 'Minimal Mode' : 'Standard Mode'}
        </Button>
        
        <Button 
          variant={editorConfig.fullscreen ? 'contained' : 'outlined'} 
          onClick={() => handleConfigChange({ fullscreen: !editorConfig.fullscreen })}
        >
          {editorConfig.fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
        
        <Select
          value={editorConfig.mode}
          onChange={(e) => handleConfigChange({ mode: e.target.value })}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="project">Project Mode</MenuItem>
          <MenuItem value="track">Track Mode</MenuItem>
          <MenuItem value="action">Action Mode</MenuItem>
        </Select>
      </Box>
      
      /**
       * Editor component
       * 
       * The editor component that displays the file content.
       */
      <Editor 
        minimal={editorConfig.minimal}
        fullscreen={editorConfig.fullscreen}
        detailMode={editorConfig.detailMode}
        mode={editorConfig.mode}
        fileView={true}
        labels={true}
      />
    </Box>
  );
}