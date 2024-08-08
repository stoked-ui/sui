import * as React from 'react';
import Card from '@mui/material/Card';
import Fade from '@mui/material/Fade';
import {
  FileList,
  InitializeFileListProps,
} from '@stoked-ui/file-explorer';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = day * 7;
const month = week * 4;

const createRelativeDate = (diff: number) => {
  const now = Date.now();
  const diffDate = new Date(now - diff);
  return diffDate.getTime();
};

const ITEMS = [
  {
    id: '1',
    label: 'Documents',
    expanded: true,
    selected: true,
    modified: createRelativeDate(month),
    nodes: [
      {
        id: '1.1',
        label: 'Company',
        expanded: true,
        modified: createRelativeDate(3 * week),
        nodes: [
          {
            id: '1.1.1',
            label: 'Invoice',
            type: 'pdf',
            size: 234223424,
            modified: createRelativeDate(2 * week),
          },
          {
            id: '1.1.2',
            label: 'Meeting notes',
            type: 'doc',
            size: 233423424,
            modified: createRelativeDate(2 * week + 3 * day),
          },
          {
            id: '1.1.3',
            label: 'Tasks list',
            type: 'doc',
            size: 123423424,
            modified: createRelativeDate(3 * day),
          },
          {
            id: '1.1.4',
            label: 'Equipment',
            type: 'pdf',
            size: 293424,
            modified: createRelativeDate(2 * hour),
          },
          {
            id: '1.1.5',
            label: 'Video conference',
            type: 'video',
            size: 423424,
            modified: createRelativeDate(2 * week),
          },
        ],
      },
      {
        id: '1.2',
        label: 'Personal',
        type: 'folder',
        modified: createRelativeDate(1 * day),
      },
      {
        id: '1.3',
        label: 'Group photo',
        type: 'image',
        size: 2238424,
        modified: createRelativeDate(2 * week),
      },
    ],
  },
  {
    id: '2',
    label: 'Bookmarked',
    modified: createRelativeDate(1 * day),
    nodes: [
      {
        id: '2.1',
        label: 'Learning materials',
        type: 'folder',
        modified: createRelativeDate(1 * hour),
      },
      {
        id: '2.2',
        label: 'News',
        type: 'folder',
        modified: createRelativeDate(5 * hour),
      },
      {
        id: '2.3',
        label: 'Forums',
        type: 'folder',
        modified: createRelativeDate(3 * hour),
      },
      {
        id: '2.4',
        label: 'Travel documents',
        type: 'pdf',
        size: 23424,
        modified: createRelativeDate(23 * hour),
      },
    ],
  },
  {
    id: '3',
    label: 'History',
    type: 'folder',
    modified: createRelativeDate(1 * week),
  },
];
/*

const typeConfig: TypeConfig = {
  folder: {
    draggable: true,
    dropTarget: '*',
    onDrop: 'make-child',
  },
  trash: {
    draggable: false,
    dropTarget: '*',
    onDrop: 'remove'
  },
  '*': {
    draggable: true,
    dropTarget: false,
  }
}
*/

const props = InitializeFileListProps(ITEMS);
export default function FileExplorerCard() {
  return (
    <Fade in timeout={700}>
      <Card
        data-mui-color-scheme="dark"
        sx={{
          minWidth: 280,
          maxWidth: 360,
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <FileList
          id={'file-explorer'}
          {...props}
          sx={{ height: 'fit-content', flexGrow: 1, overflowY: 'auto', width: '100%' }}
          grid
        />
      </Card>
    </Fade>
  );
}
