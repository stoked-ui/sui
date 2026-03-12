import type { MuiPage } from '../src/MuiPage';

const macMixerPages: MuiPage[] = [
  {
    pathname: '/products/mac-mixer/docs',
    title: 'Mac Mixer',
    alpha: true,
    children: [
      { pathname: '/products/mac-mixer/docs/overview', title: 'Overview' },
      { pathname: '/products/mac-mixer/docs/app-volumes', title: 'App Volumes' },
      { pathname: '/products/mac-mixer/docs/auto-pause', title: 'Auto-Pause' },
      { pathname: '/products/mac-mixer/docs/recording', title: 'Recording' },
      { pathname: '/products/mac-mixer/docs/download', title: 'Download' },
      { pathname: '/products/mac-mixer/docs/roadmap' },
    ],
  },
];

export default macMixerPages;
