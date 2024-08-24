import { FileBase } from "@stoked-ui/file-explorer";

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

export const BasicFiles = [
  {
    name: 'Notes',
    children: [
      { name: 'doc.pdf' },
      { name: 'notes.txt' },
    ],
  },
  {
    name: 'Images',
    children: [
      { name: 'logo.png' },
      { name: 'favicon.ico'},
    ],
  },
  {
    name: 'Movies',
    children: [{ name: "Donnie Darko.mp4" }],
  },
  {
    name: 'Data',
    children: [{ name: "client-data.xls"}],
  },
];
export const NestedFiles: FileBase[] = [
  {
    id: '1',
    label: 'Documents',
    expanded: true,
    selected: true,
    children: [
      {
        id: '1.1',
        label: 'Company',
        expanded: true,
        children: [
          {
            id: '1.1.1',
            label: 'Invoice',
            type: 'pdf',
            size: 234223424,
          },
          {
            id: '1.1.2',
            label: 'Meeting notes',
            type: 'doc',
            size: 233423424,
          },
          {
            id: '1.1.3',
            label: 'Tasks list',
            type: 'doc',
            size: 123423424,
          },
          {
            id: '1.1.4',
            label: 'Equipment',
            type: 'pdf',
            size: 293424,
          },
          {
            id: '1.1.5',
            label: 'Video conference',
            type: 'video',
            size: 423424,
          },
        ],
      },
      {
        id: '1.2',
        label: 'Personal',
        type: 'folder',
      },
      {
        id: '1.3',
        label: 'Group photo',
        type: 'image',
        size: 2238424,
      },
    ],
  },
  {
    id: '2',
    label: 'Bookmarked',
    children: [
      {
        id: '2.1',
        label: 'Learning materials',
        type: 'folder',
      },
      {
        id: '2.2',
        label: 'News',
        type: 'folder',
      },
      {
        id: '2.3',
        label: 'Forums',
        type: 'folder',
      },
      {
        id: '2.4',
        label: 'Travel documents',
        type: 'pdf',
        size: 23424,
      },
    ],
  },
  {
    id: '3',
    label: 'History',
    type: 'folder',
  }
];

export function getDynamicFiles (): readonly FileBase[] {
  return [
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
    }
  ];
}
