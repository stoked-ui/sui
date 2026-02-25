import type { MuiPage } from '../src/MuiPage';

const stokdCloudPages: MuiPage[] = [
  {
    pathname: '/stokd-cloud/docs',
    title: 'Stokd Cloud',
    dev: true,
    children: [
      { pathname: '/stokd-cloud/docs/overview', title: 'Overview' },
      { pathname: '/stokd-cloud/docs/vscode-extension', title: 'VSCode Extension' },
      { pathname: '/stokd-cloud/docs/state-api', title: 'State API' },
      { pathname: '/stokd-cloud/docs/review-commands', title: 'Review Commands' },
      { pathname: '/stokd-cloud/docs/roadmap' },
    ],
  },
];

export default stokdCloudPages;
