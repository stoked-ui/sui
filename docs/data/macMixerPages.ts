import type { MuiPage } from '../src/MuiPage';

const macMixerPages: MuiPage[] = [
  {
    pathname: '/products/mac-mixer/docs',
    title: 'Mac Mixer',
    alpha: true,
    children: [
      { pathname: '/products/mac-mixer/docs/overview', title: 'Overview' },
      { pathname: '/products/mac-mixer/docs/app-volumes', title: 'Routing and Volumes' },
      { pathname: '/products/mac-mixer/docs/installation', title: 'Installation' },
      { pathname: '/products/mac-mixer/docs/configuration', title: 'Configuration' },
      { pathname: '/products/mac-mixer/docs/licensing', title: 'Licensing' },
      { pathname: '/products/mac-mixer/docs/roadmap' },
    ],
  },
];

export default macMixerPages;
