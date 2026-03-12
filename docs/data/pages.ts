import type { MuiPage } from '../src/MuiPage';
import fileExplorerComponentApi from './file-explorer-component-api-pages';
import timelineComponentApi from './timeline-component-api-pages';
import editorComponentApi from './editor-component-api-pages';

const pages: MuiPage[] = [
  {
    pathname: '/products/stoked-ui/introduction-group',
    title: 'Introduction',
    children: [
      { pathname: `/products/stoked-ui/docs/overview`, title: 'Overview' },
      { pathname: `/products/stoked-ui/docs/installation` },
      { pathname: `/products/stoked-ui/docs/usage` },
      { pathname: `/products/stoked-ui/docs/example-projects` },
      { pathname: `/products/stoked-ui/docs/faq` },
      { pathname: `/products/stoked-ui/docs/support` },
      { pathname: `/products/stoked-ui/docs/consulting` },
      { pathname: `/products/stoked-ui/docs/vision` },
      { pathname: `/products/stoked-ui/docs/roadmap` },
    ],
  },
  {
    pathname: '/products/common/docs',
    title: 'Common',
    children: [
      { pathname: '/products/common/docs/overview', title: 'Overview' },
      { pathname: '/products/common/docs/usage', title: 'Usage' },
      { pathname: '/products/common/docs/namedId', title: 'NamedId' },
      { pathname: '/products/common/docs/roadmap' },
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
    pathname: '/products/media/docs',
    title: 'Media',
    newFeature: true,
    children: [
      { pathname: '/products/media/docs/overview', title: 'Overview' },
      { pathname: '/products/media/docs/media-file', title: 'MediaFile' },
      { pathname: '/products/media/docs/media-viewer', title: 'MediaViewer' },
      { pathname: '/products/media/docs/media-card', title: 'MediaCard' },
      { pathname: '/products/media/docs/api-client', title: 'API Client' },
      { pathname: '/products/media/docs/hooks', title: 'Hooks' },
      { pathname: '/products/media/docs/migration', title: 'Migration Guide' },
      { pathname: '/products/media/docs/roadmap' },
    ],
  },
  {
    pathname: '/products/media-api/docs',
    title: 'Media API',
    newFeature: true,
    children: [
      { pathname: '/products/media-api/docs/overview', title: 'Overview' },
      { pathname: '/products/media-api/docs/quick-start', title: 'Quick Start' },
      { pathname: '/products/media-api/docs/endpoints', title: 'Endpoints' },
      { pathname: '/products/media-api/docs/upload-api', title: 'Upload API' },
      { pathname: '/products/media-api/docs/roadmap' },
    ],
  },
  {
    pathname: '/products/file-explorer/docs',
    title: 'File Explorer',
    beta: true,
    children: [
      { pathname: '/products/file-explorer/docs/overview', title: 'Overview' },
      { pathname: '/products/file-explorer/docs/getting-started' },
      {
        pathname: '/products/file-explorer/docs/file-explorer-basic',
        subheader: 'File Explorer Basic',
        children: [
          { pathname: '/products/file-explorer/docs/file-explorer-basic/items' },
          { pathname: '/products/file-explorer/docs/file-explorer-basic/selection' },
          { pathname: '/products/file-explorer/docs/file-explorer-basic/expansion' },
          { pathname: '/products/file-explorer/docs/file-explorer-basic/customization' },
          { pathname: '/products/file-explorer/docs/file-explorer-basic/focus' },
        ],
      },
      {
        pathname: '/products/file-explorer/docs/file-explorer/*',
        subheader: 'File Explorer',
        children: [
          { pathname: '/products/file-explorer/docs/file-explorer/items' },
          { pathname: '/products/file-explorer/docs/file-explorer/selection' },
          { pathname: '/products/file-explorer/docs/file-explorer/expansion' },
          { pathname: '/products/file-explorer/docs/file-explorer/customization' },
          { pathname: '/products/file-explorer/docs/file-explorer/focus' },
          { pathname: '/products/file-explorer/docs/file-explorer/dragzone' },
          { pathname: '/products/file-explorer/docs/file-explorer/drag-and-drop' },
        ],
      },
      {
        pathname: '/products/file-explorer/docs/common',
        subheader: 'Common features',
        children: [
          { pathname: '/products/file-explorer/docs/accessibility' },
          { pathname: '/products/file-explorer/docs/file-customization', title: 'File customization' },
        ],
      },
      { pathname: `/products/file-explorer/docs/roadmap` },
      {
        pathname: '/products/file-explorer/docs/api/file-explorer-group',
        title: 'API Reference',
        children: [...fileExplorerComponentApi],
      },
    ],
  },
  {
    pathname: `/products/timeline/docs`,
    title: 'Timeline',
    alpha: true,
    children: [
      { pathname: `/products/timeline/docs/overview`, title: 'Overview' },
      /* { pathname: '/products/timeline/docs/getting-started' },
      {
        pathname: '/products/timeline/docs/basics',
        subheader: 'Basics',
        children: [
          { pathname: '/products/timeline/docs/labels' },
          { pathname: '/products/timeline/docs/scale' },
          { pathname: '/products/timeline/docs/actions' },
          { pathname: '/products/timeline/docs/customize' },
          { pathname: '/products/timeline/docs/grid' },
        ],
      },
      {
        pathname: '/products/timeline/docs/advanced',
        subheader: 'In Depth',
        children: [
          {pathname: '/products/timeline/docs/events-callbacks'},
          {pathname: '/products/timeline/docs/controls'},
          {pathname: '/products/timeline/docs/drop-add'},
        ]
      },
      { pathname: `/products/timeline/docs/roadmap` }, */
      {
        pathname: `/products/timeline/docs/api/timeline-group`,
        title: 'API Reference',
        children: [...timelineComponentApi],
      },
    ],
  },
  {
    pathname: '/video-renderer/docs',
    title: 'Video Renderer',
    newFeature: true,
    children: [
      { pathname: '/video-renderer/docs/overview', title: 'Overview' },
      { pathname: '/video-renderer/docs/quick-start', title: 'Quick Start' },
      {
        pathname: '/video-renderer/docs/backend',
        subheader: 'Backend',
        children: [
          { pathname: '/video-renderer/docs/rust-backend', title: 'Rust Backend' },
          { pathname: '/video-renderer/docs/nodejs-integration', title: 'Node.js Integration' },
        ],
      },
      {
        pathname: '/video-renderer/docs/frontend',
        subheader: 'Frontend',
        children: [
          { pathname: '/video-renderer/docs/wasm-frontend', title: 'WASM Frontend' },
        ],
      },
      { pathname: '/video-renderer/docs/api-reference', title: 'API Reference' },
    ],
  },
  {
    pathname: `/products/editor/docs`,
    title: 'Editor',
    alpha: true,
    children: [
      { pathname: `/products/editor/docs/overview`, title: 'Overview' },
      { pathname: `/products/editor/docs/getting-started` },
      {
        pathname: `/products/editor/components`,
        subheader: 'Components',
        children: [
          { pathname: `/products/editor/components/editor`, title: 'Editor' },
        ],
      },
      {
        pathname: `/products/editor/docs/basics`,
        subheader: 'Basics',
        children: [
          { pathname: `/products/editor/docs/labels` },
          { pathname: `/products/editor/docs/scale` },
          { pathname: `/products/editor/docs/actions` },
          { pathname: `/products/editor/docs/customize` },
          { pathname: `/products/editor/docs/grid` },
        ],
      },
      {
        pathname: `/products/editor/docs/advanced`,
        subheader: 'In Depth',
        children: [
          {pathname: `/products/editor/docs/events-callbacks`},
          {pathname: `/products/editor/docs/controls`},
          {pathname: `/products/editor/docs/drop-add`},
          {pathname: `/products/editor/docs/backend-processing`},
        ]
      },
      { pathname: `/products/editor/docs/roadmap` },
      {
        pathname: `/products/editor/docs/api/editor-group`,
        title: 'API Reference',
        children: [...editorComponentApi],
      },
    ],
  },
];

export default pages;
