import type { MuiPage } from '../src/MuiPage';
import fileExplorerComponentApi from './file-explorer-component-api-pages';

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
      { pathname: `/stoked-ui/docs/roadmap` },
    ],
  },
  {
    pathname: '/media-selector/docs/group',
    title: 'Media Selector',
    newFeature: true,
    children: [
      { pathname: '/media-selector/docs/overview', title: 'Overview' },
      { pathname: '/media-selector/docs/file-with-path', title: 'FileWithPath' },
      { pathname: '/media-selector/docs/id-generator', title: 'IdGenerator' },
      { pathname: `/media-selector/docs/roadmap` },
    ],
  },
  {
    pathname: '/file-explorer/docs/group',
    title: 'File Explorer',
    newFeature: true,
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
];

export default pages;
