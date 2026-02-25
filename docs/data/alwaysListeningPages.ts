import type { MuiPage } from '../src/MuiPage';

const alwaysListeningPages: MuiPage[] = [
  {
    pathname: '/always-listening/docs',
    title: 'Always Listening',
    dev: true,
    children: [
      { pathname: '/always-listening/docs/overview', title: 'Overview' },
      { pathname: '/always-listening/docs/voice-modes', title: 'Voice Modes' },
      { pathname: '/always-listening/docs/preferences', title: 'Preferences' },
      { pathname: '/always-listening/docs/roadmap' },
    ],
  },
];

export default alwaysListeningPages;
