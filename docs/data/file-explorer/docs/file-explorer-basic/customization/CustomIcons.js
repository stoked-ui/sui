import * as React from 'react';
import Box from '@mui/material/Box';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import SvgIcon from '@mui/material/SvgIcon';
import { styled } from '@mui/material/styles';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import {
  FileElement,
  fileElementClasses,
} from '@stoked-ui/file-explorer/FileElement';

const CustomTreeItem = styled(FileElement)({
  [`& .${fileElementClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
});

function CloseSquare(props) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 30, height: 14 }}
      {...props}
    >
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

export default function CustomIcons() {
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <FileExplorerBasic
        defaultExpandedItems={['Notes']}
        slots={{
          expandIcon: AddBoxIcon,
          collapseIcon: IndeterminateCheckBoxIcon,
          endIcon: CloseSquare,
        }}
      >
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

