import type SuiPage from 'docs/src/SuiPage';
import standardNavIcons from 'docs/src/modules/components/AppNavIcons';

const pages: readonly SuiPage[] = [
  { pathname: '/versions' },
  {
    pathname: 'https://mui.com/store/',
    title: 'Templates',
    icon: standardNavIcons.ReaderIcon,
    linkProps: {
      'data-ga-event-category': 'store',
      'data-ga-event-action': 'click',
      'data-ga-event-label': 'sidenav',
    },
  },
  { pathname: '/blog', title: 'Blog', icon: standardNavIcons.BookIcon },
];

export default pages;
