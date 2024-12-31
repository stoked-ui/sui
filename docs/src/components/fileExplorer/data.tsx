import {FileBase} from "@stoked-ui/file-explorer";

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
    name: 'Documents',
    expanded: true,
    selected: true,
    type: 'folder',
    mediaType: 'folder',
    children: [
      {
        id: '1.1',
        name: 'Company',
        expanded: true,
        type: 'folder',
        mediaType: 'folder',
        children: [
          {
            id: '1.1.1',
            name: 'Invoice',
            type: 'application/pdf',
            mediaType: 'pdf',
            size: 234223424,
          },
          {
            id: '1.1.2',
            name: 'Meeting notes.doc',
            type: 'application/msword',
            mediaType: 'doc',
            size: 233423424,
          },
          {
            id: '1.1.3',
            name: 'Tasks list.doc',
            type: 'application/msword',
            mediaType: 'doc',
            size: 123423424,
          },
          {
            id: '1.1.4',
            name: 'Equipment',
            type: 'application/pdf',
            mediaType: 'pdf',
            size: 293424,
          },
          {
            id: '1.1.5',
            name: 'Video conference',
            type: 'video/mp4',
            mediaType: 'video',
            size: 423424,
          },
        ],
      },
      {
        id: '1.2',
        name: 'Personal',
        type: 'folder',
        mediaType: 'folder',
      },
      {
        id: '1.3',
        name: 'Group photo.jpg',
        type: 'image/jpeg',
        mediaType: 'image',
        size: 2238424,
      },
    ],
  },
  {
    id: '2',
    name: 'Bookmarked',
    type: 'folder',
    mediaType: 'folder',
    children: [
      {
        id: '2.1',
        name: 'Learning materials',
        type: 'folder',
        mediaType: 'folder',
      },
      {
        id: '2.2',
        name: 'News',
        type: 'folder',
        mediaType: 'folder',
      },
      {
        id: '2.3',
        name: 'Forums',
        type: 'folder',
        mediaType: 'folder',
      },
      {
        id: '2.4',
        name: 'Travel documents',
        type: 'application/pdf',
        mediaType: 'pdf',
        size: 23424,
      },
    ],
  },
  {
    id: '3',
    name: 'History',
    type: 'folder',
    mediaType: 'folder',
  }
];

export function getDynamicFiles (): readonly FileBase[] {
  return [
    {
      id: '1',
      name: 'Documents',
      expanded: true,
      selected: true,
      type: 'folder',
      mediaType: 'folder',
      lastModified: createRelativeDate(month),
      children: [
        {
          id: '1.1',
          name: 'Company',
          expanded: true,
          lastModified: createRelativeDate(3 * week),
          type: 'folder',
          mediaType: 'folder',
          children: [
            {
              id: '1.1.1',
              name: 'Invoice',
              type: 'application/pdf',
              mediaType: 'pdf',
              size: 234223424,
              lastModified: createRelativeDate(2 * week),
            },
            {
              id: '1.1.2',
              name: 'Meeting notes.doc',
              type: 'application/msword',
              mediaType: 'doc',
              size: 233423424,
              lastModified: createRelativeDate(2 * week + 3 * day),
            },
            {
              id: '1.1.3',
              name: 'Tasks list.doc',
              type: 'application/msword',
              mediaType: 'doc',
              size: 123423424,
              lastModified: createRelativeDate(3 * day),
            },
            {
              id: '1.1.4',
              name: 'Equipment.pdf',
              type: 'application/pdf',
              mediaType: 'pdf',
              size: 293424,
              lastModified: createRelativeDate(2 * hour),
            },
            {
              id: '1.1.5',
              name: 'Video conference.mp4',
              type: 'video/mp4',
              mediaType: 'video',
              media: {
                duration: 1000 * 60 * 10,
              },
              size: 423424,
              lastModified: createRelativeDate(2 * week),
            },
          ],
        },
        {
          id: '1.2',
          name: 'Personal',
          type: 'folder',
          mediaType: 'folder',
          lastModified: createRelativeDate(1 * day),
        },
        {
          id: '1.3',
          name: 'Group photo.jpg',
          type: 'image/jpeg',
          mediaType: 'image',
          size: 2238424,
          lastModified: createRelativeDate(2 * week),
        },
      ],
    },
    {
      id: '2',
      name: 'Bookmarked',
      type: 'folder',
      mediaType: 'folder',
      lastModified: createRelativeDate(1 * day),
      children: [
        {
          id: '2.1',
          name: 'Learning materials',
          type: 'folder',
          mediaType: 'folder',
          lastModified: createRelativeDate(1 * hour),
        },
        {
          id: '2.2',
          name: 'News',
          type: 'folder',
          mediaType: 'folder',
          lastModified: createRelativeDate(5 * hour),
        },
        {
          id: '2.3',
          name: 'Forums',
          type: 'folder',
          mediaType: 'folder',
          lastModified: createRelativeDate(3 * hour),
        },
        {
          id: '2.4',
          name: 'Travel documents',
          type: 'application/pdf',
          mediaType: 'pdf',
          size: 23424,
          lastModified: createRelativeDate(23 * hour),
        },
      ],
    },
    {
      id: '3',
      name: 'History',
      type: 'folder',
      mediaType: 'folder',
      lastModified: createRelativeDate(1 * week),
    }
  ];
}
