import type { MuiPage } from '../src/MuiPage';

const macMixerPages: MuiPage[] = [
  {
    pathname: '/mac-mixer/docs',
    title: 'Mac Mixer',
    alpha: true,
    children: [
      { pathname: '/mac-mixer/docs/overview', title: 'Overview' },
      { pathname: '/mac-mixer/docs/app-volumes', title: 'App Volumes' },
      { pathname: '/mac-mixer/docs/auto-pause', title: 'Auto-Pause' },
      { pathname: '/mac-mixer/docs/recording', title: 'Recording' },
      { pathname: '/mac-mixer/docs/download', title: 'Download' },
      { pathname: '/mac-mixer/docs/roadmap' },
    ],
  },
];

export default macMixerPages;
