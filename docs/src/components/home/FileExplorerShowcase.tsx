import * as React from 'react';
import Box from '@mui/material/Box';
import ShowcaseContainer from 'docs/src/components/home/ShowcaseContainer';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/components/markdown/MarkdownElement';
import {FileExplorer} from "@stoked-ui/file-explorer";
import { getDynamicFiles } from '../fileExplorer/data';
import {SxProps} from "@mui/system";


const code = `<FileExplorer
  items={getDynamicFiles()}
  defaultExpandedItems={['1', '1.1']}
  defaultSelectedItems="1.1"
  sx={{ height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', }}
  id={'file-explorer-hero'}
  alternatingRows
  dndInternal
  dndExternal
  dndTrash
  grid
/>`

export default function FileExplorerShowcase() {
  const sx: SxProps = { height: 'fit-content', flexGrow: 1, width: '100%', overflowY: 'auto', };
  return (
    <ShowcaseContainer
      id={'file-explorer-showcase'}
      demoSx={{ alignItems: 'top' }}
      preview={
        <FileExplorer
          items={getDynamicFiles()}
          defaultExpandedItems={['1', '1.1']}
          defaultSelectedItems="1.1"
          sx={sx}
          id={'file-explorer-hero'}
          alternatingRows
          dndInternal
          dndExternal
          dndTrash
          grid
        />
      }
      code={
        <Box
          sx={{
            overflow: 'auto',
            flexGrow: 1,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '& pre': {
              bgcolor: 'transparent !important',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            },
          }}
        >
          <HighlightedCode
            copyButtonHidden
            component={MarkdownElement}
            code={code}
            language="jsx"
          />
        </Box>
      }
    />
  );
}

