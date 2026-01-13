import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const EditorBackendProcessingDemo = React.lazy(() =>
  import('docs/src/components/showcase/EditorBackendProcessingDemo'),
);

export default function BackendProcessingDemo() {
  return (
    <React.Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <EditorBackendProcessingDemo id="backend-processing-demo" />
    </React.Suspense>
  );
}
