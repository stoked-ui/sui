import * as React from 'react';
import MuiChip from '@mui/material/Chip';
import MuiCardMedia from '@mui/material/CardMedia';
import MuiCard, { CardProps } from '@mui/material/Card';
import MuiSwitch from '@mui/material/Switch';
import MuiTypography from '@mui/material/Typography';
import MuiStack from '@mui/material/Stack';
import MuiRating from '@mui/material/Rating';
import { withPointer } from 'docs/src/components/home/ElementPointer';
import { FileExplorer, FileElement, FileExplorerViewBaseItem } from "@stoked-ui/file-explorer";
import FileExplorerFiles from '../fileExplorer/data';

export const componentCode = `
const [active, setActive] = React.useState(true);
  return (
    <FileExplorer
      items={FileExplorerFiles as readonly FileExplorerViewBaseItem[]}
      defaultExpandedItems={['1', '1.1']}
      defaultSelectedItems="1.1"
      slots={{ item: FileElement }}
      {...props}
      id={props.id}
    />
  );
`;

const Card = withPointer(MuiCard, { id: 'card', name: 'Card' });
const CardMedia = withPointer(MuiCardMedia, { id: 'cardmedia', name: 'CardMedia' });
const Stack = withPointer(MuiStack, { id: 'stack', name: 'Stack' });
const Stack2 = withPointer(MuiStack, { id: 'stack2', name: 'Stack' });
const Stack3 = withPointer(MuiStack, { id: 'stack3', name: 'Stack' });
const Typography = withPointer(MuiTypography, { id: 'typography', name: 'Typography' });
const Chip = withPointer(MuiChip, { id: 'chip', name: 'Chip' });
const Rating = withPointer(MuiRating, { id: 'rating', name: 'Rating' });
const Switch = withPointer(MuiSwitch, { id: 'switch', name: 'Switch' });
export default function MaterialDesignDemo(props: CardProps) {
  const [active, setActive] = React.useState(true);
  return (
    <div>

    </div>
  );
}
