import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, alpha } from '@mui/material/styles';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import {
  FileElement,
  fileElementClasses,
} from '@stoked-ui/file-explorer/FileElement';

const CustomTreeItem = styled(FileElement)(({ theme }) => ({
  color:
    theme.palette.mode === 'light'
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
  [`& .${fileElementClasses.content}`]: {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    [`& .${fileElementClasses.label}`]: {
      fontSize: '0.8rem',
      fontWeight: 500,
    },
  },
  [`& .${fileElementClasses.iconContainer}`]: {
    borderRadius: '50%',
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.primary.main, 0.25)
        : theme.palette.primary.dark,
    color: theme.palette.mode === 'dark' && theme.palette.primary.contrastText,
    padding: theme.spacing(0, 1.2),
  },
  [`& .${fileElementClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

export default function CustomStyling() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic defaultExpandedItems={['grid']}>
        <CustomTreeItem name={'Notes'}>
          <CustomTreeItem name="doc.pdf" />
          <CustomTreeItem name="notes.txt" />
        </CustomTreeItem>
        <CustomTreeItem name={'Images'}>
          <CustomTreeItem name={'logo.png'} />
          <CustomTreeItem name={'favicon.ico'} />
        </CustomTreeItem>
        <CustomTreeItem name={'Movies'}>
          <CustomTreeItem name={'feature.mp4'} />
        </CustomTreeItem>
        <CustomTreeItem name={'Data'}>
          <CustomTreeItem name={'client-data.xls'} />
        </CustomTreeItem>
      </FileExplorerBasic>
    </Box>
  );
}
