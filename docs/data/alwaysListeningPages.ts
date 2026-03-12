import type { MuiPage } from '../src/MuiPage';

const alwaysListeningPages: MuiPage[] = [
  {
    pathname: '/products/always-listening/docs',
    title: 'Always Listening',
    dev: true,
    children: [
      { pathname: '/products/always-listening/docs/overview', title: 'Overview' },
      { pathname: '/products/always-listening/docs/voice-modes', title: 'Voice Modes' },
      { pathname: '/products/always-listening/docs/preferences', title: 'Preferences' },
      { pathname: '/products/always-listening/docs/roadmap' },
    ],
  },
];

export default alwaysListeningPages;
