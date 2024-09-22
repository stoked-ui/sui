import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  FileExplorerPropsBase,
  FileExplorerRoot,
  FILE_EXPLORER_PLUGINS,
  FileExplorerPluginParameters,
  FileExplorerPluginSlots,
  FileExplorerPluginSlotProps,
} from '@stoked-ui/file-explorer/FileExplorer';
import { FileElement } from '@stoked-ui/file-explorer/FileElement';
import {
  UseFileExplorerExpansionSignature,
  FileExplorerPlugin,
  FileExplorerPluginSignature,
  useFileExplorer,
  FileExplorerProvider,
  ConvertPluginsIntoSignatures,
} from '@stoked-ui/file-explorer/internals';
import { NestedFiles } from 'docs/src/components/fileExplorer/data';

interface FileExplorerLogExpandedParameters {
  areLogsEnabled?: boolean;
  logMessage?: (message: string) => void;
}

interface FileExplorerLogExpandedDefaultizedParameters {
  areLogsEnabled: boolean;
  logMessage?: (message: string) => void;
}

type FileExplorerLogExpandedSignature = FileExplorerPluginSignature<{
  // The parameters of this plugin as they are passed to `useFileExplorer`
  params: FileExplorerLogExpandedParameters;
  // The parameters of this plugin as they are passed to the plugin after calling `plugin.getDefaultizedParams`
  defaultizedParams: FileExplorerLogExpandedDefaultizedParameters;
  // Dependencies of this plugin (we need the expansion plugin to access its model)
  dependencies: [UseFileExplorerExpansionSignature];
}>;


const useFileExplorerLogExpanded: FileExplorerPlugin<FileExplorerLogExpandedSignature> = ({
  params,
  models,
}) => {
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

export interface FileExplorerProps<R extends {}, Multiple extends boolean | undefined>
  extends FileExplorerPluginParameters<R, Multiple>,
    FileExplorerLogExpandedParameters,
    FileExplorerPropsBase {
  slots?: FileExplorerPluginSlots;
  slotProps?: FileExplorerPluginSlotProps;
}

const TREE_VIEW_PLUGINS = [
  ...FILE_EXPLORER_PLUGINS,
  useFileExplorerLogExpanded,
] as const;

type FileExplorerPluginSignatures = ConvertPluginsIntoSignatures<
  typeof TREE_VIEW_PLUGINS
>;

function FileExplorer<R extends {}, Multiple extends boolean | undefined>(
  props: FileExplorerProps<R, Multiple>,
) {
  const { getRootProps, contextValue, instance } = useFileExplorer<
    FileExplorerPluginSignatures,
    typeof props
  >({
    plugins: TREE_VIEW_PLUGINS,
    props,
  });

  const itemsToRender = instance.getItemsToRender();

  const renderItem = ({
    children: itemChildren,
    ...itemProps
  }: ReturnType<typeof instance.getItemsToRender>[number]) => {
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

export default function LogExpandedItems() {
  const [logs, setLogs] = React.useState<string[]>([]);

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
