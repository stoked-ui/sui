import type { MuiPage } from '../src/MuiPage';

const fluxPages: MuiPage[] = [
  {
    pathname: '/products/flux/docs',
    title: 'Flux',
    newFeature: true,
    children: [
      { pathname: '/products/flux/docs/overview', title: 'Overview' },
      { pathname: '/products/flux/docs/download', title: 'Download' },
      { pathname: '/products/flux/docs/websites', title: 'Websites' },
      { pathname: '/products/flux/docs/scripting', title: 'Scripting & Automation' },
      { pathname: '/products/flux/docs/roadmap' },
    ],
  },
];

export default fluxPages;
