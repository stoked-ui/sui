import * as React from 'react';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import { styled, alpha } from '@mui/material/styles';
import { FileExplorerBasic } from '@stoked-ui/file-explorer/FileExplorerBasic';
import {
  FileElement,
  fileElementClasses,
} from '@stoked-ui/file-explorer/FileElement';

const CustomTreeItem = styled(FileElement)(({ theme }) => ({
  [`& .${fileElementClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& .${fileElementClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${fileElementClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

function ExpandIcon(props) {
  return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function CollapseIcon(props) {
  return <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function EndIcon(props) {
  return <DisabledByDefaultRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
}

export default function BorderedFileExplorer() {
  return (
    <FileExplorerBasic
      aria-label="customized"
      defaultExpandedItems={['1', '3']}
      slots={{
        expandIcon: ExpandIcon,
        collapseIcon: CollapseIcon,
        endIcon: EndIcon,
      }}
      sx={{ overflowX: 'hidden', minHeight: 270, flexGrow: 1, maxWidth: 300 }}
    >
      <CustomTreeItem itemId="1" label="Main">
        <CustomTreeItem itemId="2" label="Hello" />
        <CustomTreeItem itemId="3" label="Subtree with children">
          <CustomTreeItem itemId="6" label="Hello" />
          <CustomTreeItem itemId="7" label="Sub-subtree with children">
            <CustomTreeItem itemId="9" label="Child 1" />
            <CustomTreeItem itemId="10" label="Child 2" />
            <CustomTreeItem itemId="11" label="Child 3" />
          </CustomTreeItem>
          <CustomTreeItem itemId="8" label="Hello" />
        </CustomTreeItem>
        <CustomTreeItem itemId="4" label="World" />
        <CustomTreeItem itemId="5" label="Something something" />
      </CustomTreeItem>
    </FileExplorerBasic>
  );
}
