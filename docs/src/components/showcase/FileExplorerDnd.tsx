import * as React from 'react';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';
import {
  FileElement,
} from '@stoked-ui/file-explorer/FileElement';
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { iconButtonClasses } from "@mui/material";
import Fade from "@mui/material/Fade";

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
    children: [
      {
        id: '1.1',
        label: 'Company',
        expanded: true,
        modified: createRelativeDate(3 * week),
        children: [
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
    children: [
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
  {
    id: 'trash',
    label: 'Trash',
    type: 'folder',
  },
];
declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

export default function FileExplorerGrid() {
  return (
    <Fade in timeout={700}>
      <Box
        sx={[
          {
            '& > div': {
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              boxShadow: (theme) => `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
            },
            '& > div > div > div': {
              width: '100%',
            },
            [`& .${iconButtonClasses.root}`]: {
              color: 'primary.500',
            },
            '& .MuiPickerStaticWrapper-root': {
              bgcolor: '#fff',
            },
            '& .MuiPickerStaticWrapper-content': {
              bgcolor: 'initial',
            },
            '& .MuiYearCalendar-root': {
              width: '100%',
            },
            '& .MuiDateCalendar-root': {
              width: '100%',
              height: 'fit-content',
              '& .MuiPickersCalendarHeader-root': {
                margin: '12px 0',
                paddingLeft: '18px',
              },
              '& .MuiTypography-caption': {
                color: 'text.tertiary',
                height: 24,
              },
              '[role="presentation"]': {
                '& .MuiIconButton-root': {
                  padding: 0,
                },
              },
              '& .MuiPickersSlideTransition-root': {
                minHeight: 165,
              },
              '& .MuiPickersYear-yearButton': {
                flexBasis: '20%',
                fontSize: '0.875rem',
                height: 'auto',
                width: 'auto',
                padding: '8px 12px',
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: 'primary.main',
                },
              },
              '& [role="row"]': {
                justifyContent: 'space-around',
              },
              '& .MuiDateCalendar-viewTransitionContainer > div > div': {
                justifyContent: 'space-around',
              },
              '& .MuiPickersDay-root': {
                width: 24,
                height: 24,
                fontWeight: 500,
                '&:not(:hover)': {
                  bgcolor: 'transparent',
                },
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: 'primary.main',
                },
                '&.MuiPickersDay-today': {
                  '&:not(.Mui-selected)': {
                    borderColor: 'primary.main',
                  },
                },
              },
            },
          },
          (theme) =>
            theme.applyDarkStyles({
              '& > div': {
                borderColor: 'primaryDark.700',
                bgcolor: 'primaryDark.900',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
              },
              [`& .${iconButtonClasses.root}`]: {
                color: 'primary.300',
              },
              '& .MuiDateCalendar-root': {
                '& .MuiPickersDay-root': {
                  color: 'primary.100',
                },
              },
            }),
        ]}
       />
    </Fade>
  );
}

