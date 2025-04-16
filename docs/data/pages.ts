import type { MuiPage } from '../src/MuiPage';
import fileExplorerComponentApi from './file-explorer-component-api-pages';
import timelineComponentApi from './timeline-component-api-pages';
import editorComponentApi from './editor-component-api-pages';

const pages: MuiPage[] = [
  {
    pathname: '/stoked-ui/introduction-group',
    title: 'Introduction',
    children: [
      { pathname: `/stoked-ui/docs/overview`, title: 'Overview' },
      { pathname: `/stoked-ui/docs/installation` },
      { pathname: `/stoked-ui/docs/usage` },
      { pathname: `/stoked-ui/docs/example-projects` },
      { pathname: `/stoked-ui/docs/faq` },
      { pathname: `/stoked-ui/docs/support` },
      { pathname: `/stoked-ui/docs/consulting` },
      { pathname: `/stoked-ui/docs/vision` },
      { pathname: `/stoked-ui/docs/roadmap` },
    ],
  },
  {
    pathname: '/media-selector/docs',
    title: 'Media Selector',
    newFeature: true,
    children: [
      { pathname: '/media-selector/docs/overview', title: 'Overview' },
      { pathname: '/media-selector/docs/file-with-path', title: 'MediaFile' },
      { pathname: '/media-selector/docs/id-generator', title: 'IdGenerator' },
      { pathname: `/media-selector/docs/roadmap` },
    ],
  },

  {
    pathname: '/file-explorer/docs',
    title: 'File Explorer',
    beta: true,
    children: [
      { pathname: '/file-explorer/docs/overview', title: 'Overview' },
      { pathname: '/file-explorer/docs/getting-started' },
      {
        pathname: '/file-explorer/docs/file-explorer-basic',
        subheader: 'File Explorer Basic',
        children: [
          { pathname: '/file-explorer/docs/file-explorer-basic/items' },
          { pathname: '/file-explorer/docs/file-explorer-basic/selection' },
          { pathname: '/file-explorer/docs/file-explorer-basic/expansion' },
          { pathname: '/file-explorer/docs/file-explorer-basic/customization' },
          { pathname: '/file-explorer/docs/file-explorer-basic/focus' },
        ],
      },
      {
        pathname: '/file-explorer/docs/file-explorer/*',
        subheader: 'File Explorer',
        children: [
          { pathname: '/file-explorer/docs/file-explorer/items' },
          { pathname: '/file-explorer/docs/file-explorer/selection' },
          { pathname: '/file-explorer/docs/file-explorer/expansion' },
          { pathname: '/file-explorer/docs/file-explorer/customization' },
          { pathname: '/file-explorer/docs/file-explorer/focus' },
          { pathname: '/file-explorer/docs/file-explorer/dragzone' },
          { pathname: '/file-explorer/docs/file-explorer/drag-and-drop' },
        ],
      },
      {
        pathname: '/file-explorer/docs/common',
        subheader: 'Common features',
        children: [
          { pathname: '/file-explorer/docs/accessibility' },
          { pathname: '/file-explorer/docs/file-customization', title: 'File customization' },
        ],
      },
      { pathname: `/file-explorer/docs/roadmap` },
      {
        pathname: '/file-explorer/docs/api/file-explorer-group',
        title: 'API Reference',
        children: [...fileExplorerComponentApi],
      },
    ],
  },
  {
    pathname: `/timeline/docs`,
    title: 'Timeline',
    alpha: true,
    children: [
      { pathname: `/timeline/docs/overview`, title: 'Overview' },
      /* { pathname: '/timeline/docs/getting-started' },
      {
        pathname: '/timeline/docs/basics',
        subheader: 'Basics',
        children: [
          { pathname: '/timeline/docs/labels' },
          { pathname: '/timeline/docs/scale' },
          { pathname: '/timeline/docs/actions' },
          { pathname: '/timeline/docs/customize' },
          { pathname: '/timeline/docs/grid' },
        ],
      },
      {
        pathname: '/timeline/docs/advanced',
        subheader: 'In Depth',
        children: [
          {pathname: '/timeline/docs/events-callbacks'},
          {pathname: '/timeline/docs/controls'},
          {pathname: '/timeline/docs/drop-add'},
        ]
      },
      { pathname: `/timeline/docs/roadmap` }, */
      {
        pathname: `/timeline/docs/api/timeline-group`,
        title: 'API Reference',
        children: [...timelineComponentApi],
      },
    ],
  },
  {
    pathname: '/github/docs',
    title: 'Github',
    newFeature: true,
    children: [
      { pathname: '/github/docs/overview', title: 'Overview' },
      { pathname: '/github/docs/github-calendar', title: ' Calendar' },
      { pathname: '/github/docs/github-events', title: 'Events' },
      { pathname: `/github/docs/roadmap`, title: 'Roadmap' },
    ],
  },
  {
    pathname: `/editor/docs`,
    title: 'Editor',
    alpha: true,
    children: [
      { pathname: `/editor/docs/overview`, title: 'Overview' },
      { pathname: `/editor/docs/getting-started` },
      {
        pathname: `/editor/components`,
        subheader: 'Components',
        children: [
          { pathname: `/editor/components/editor`, title: 'Editor' },
        ],
      },
      {
        pathname: `/editor/docs/basics`,
        subheader: 'Basics',
        children: [
          { pathname: `/editor/docs/labels` },
          { pathname: `/editor/docs/scale` },
          { pathname: `/editor/docs/actions` },
          { pathname: `/editor/docs/customize` },
          { pathname: `/editor/docs/grid` },
        ],
      },
      {
        pathname: `/editor/docs/advanced`,
        subheader: 'In Depth',
        children: [
          {pathname: `/editor/docs/events-callbacks`},
          {pathname: `/editor/docs/controls`},
          {pathname: `/editor/docs/drop-add`},
        ]
      },
      { pathname: `/editor/docs/roadmap` },
      {
        pathname: `/editor/docs/api/editor-group`,
        title: 'API Reference',
        children: [...editorComponentApi],
      },
    ],
  },
];

export default pages;
