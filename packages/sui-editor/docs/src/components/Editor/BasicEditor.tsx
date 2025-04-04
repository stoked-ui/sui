/**
 * BasicEditor component
 *
 * A simple editor component with basic functionality.
 */

import * as React from 'react';
import { Editor } from '@stoked-ui/sui-editor';
import Box from '@mui/material/Box';

export default function BasicEditor() {
  return (
    /**
     * The main container for the editor.
     */
    <Box sx={{ height: '600px', width: '100%', border: '1px solid #e0e0e0' }}>
      /**
       * The Editor component from @stoked-ui/sui-editor.
       */
      <Editor 
        /**
         * Enables the file view feature of the editor.
         */
        fileView={true}
        /**
         * Enables the labels feature of the editor.
         */
        labels={true}
      />
    </Box>
  );
}