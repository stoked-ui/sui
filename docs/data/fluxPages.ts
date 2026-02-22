import type { MuiPage } from '../src/MuiPage';

const fluxPages: MuiPage[] = [
  {
    pathname: '/flux/docs',
    title: 'Flux',
    newFeature: true,
    children: [
      { pathname: '/flux/docs/overview', title: 'Overview' },
      { pathname: '/flux/docs/download', title: 'Download' },
      { pathname: '/flux/docs/websites', title: 'Websites' },
      { pathname: '/flux/docs/scripting', title: 'Scripting & Automation' },
      { pathname: '/flux/docs/roadmap' },
    ],
  },
];

export default fluxPages;
