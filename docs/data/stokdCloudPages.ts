import type { MuiPage } from '../src/MuiPage';

const stokdCloudPages: MuiPage[] = [
  {
    pathname: '/products/stokd-cloud/docs',
    title: 'Stokd Cloud',
    dev: true,
    children: [
      { pathname: '/products/stokd-cloud/docs/overview', title: 'Overview' },
      { pathname: '/products/stokd-cloud/docs/vscode-extension', title: 'VSCode Extension' },
      { pathname: '/products/stokd-cloud/docs/state-api', title: 'State API' },
      { pathname: '/products/stokd-cloud/docs/review-commands', title: 'Review Commands' },
      { pathname: '/products/stokd-cloud/docs/roadmap' },
    ],
  },
];

export default stokdCloudPages;
