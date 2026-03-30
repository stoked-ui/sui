import type { MuiPage } from '../src/MuiPage';

const focusCapturePages: MuiPage[] = [
  {
    pathname: '/products/focus-capture/docs',
    title: 'Focus Capture',
    beta: true,
    children: [
      { pathname: '/products/focus-capture/docs/overview', title: 'Overview' },
      { pathname: '/products/focus-capture/docs/download', title: 'Download' },
      { pathname: '/products/focus-capture/docs/installation', title: 'Installation' },
      { pathname: '/products/focus-capture/docs/source-settings', title: 'Source Settings' },
      { pathname: '/products/focus-capture/docs/roadmap' },
    ],
  },
];

export default focusCapturePages;
