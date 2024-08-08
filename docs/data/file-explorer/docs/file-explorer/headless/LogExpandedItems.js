import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  FileExplorerRoot,
  FILE_EXPLORER_PLUGINS,
} from '@stoked-ui/file-explorer/FileExplorer';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import {
  useFileExplorer,
  FileExplorerProvider,
} from '@stoked-ui/file-explorer/internals';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

const useFileExplorerLogExpanded = ({ params, models }) => {
  const expandedStr = JSON.stringify(models.expandedItems.value);

  React.useEffect(() => {
    if (params.areLogsEnabled && params.logMessage) {
      params.logMessage(`Expanded items: ${expandedStr}`);
    }
  }, [expandedStr]); // eslint-disable-line react-hooks/exhaustive-deps

  return {};
};

// Sets the default value of this plugin parameters.
useFileExplorerLogExpanded.getDefaultizedParams = (params) => ({
  ...params,
  areLogsEnabled: params.areLogsEnabled ?? false,
});

useFileExplorerLogExpanded.params = {
  areLogsEnabled: true,
  logMessage: true,
};

const TREE_VIEW_PLUGINS = [...FILE_EXPLORER_PLUGINS, useFileExplorerLogExpanded];

function FileExplorer(props) {
  const { getRootProps, contextValue, instance } = useFileExplorer({
    plugins: TREE_VIEW_PLUGINS,
    props,
  });

  const itemsToRender = instance.getItemsToRender();

  const renderItem = ({ children: itemChildren, ...itemProps }) => {
    return (
      <FileElement key={itemProps.itemId} {...itemProps}>
        {itemChildren?.map(renderItem)}
      </FileElement>
    );
  };

  return (
    <FileExplorerProvider value={contextValue}>
      <FileExplorerRoot {...getRootProps()}>
        {itemsToRender.map(renderItem)}
      </FileExplorerRoot>
    </FileExplorerProvider>
  );
}

useFileExplorerLogExpanded.code = 'log';
export default function LogExpandedItems() {
  const [logs, setLogs] = React.useState([]);

  return (
    <Stack spacing={2}>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <FileExplorer
          items={NestedFiles}
          areLogsEnabled
          logMessage={(message) =>
            setLogs((prev) =>
              prev[prev.length - 1] === message ? prev : [...prev, message],
            )
          }
        />
      </Box>
      <Stack spacing={1}>
        {logs.map((log, index) => (
          <Typography key={index}>{log}</Typography>
        ))}
      </Stack>
    </Stack>
  );
}
