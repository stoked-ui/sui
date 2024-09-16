import type SuiPage from '@stoked-ui/docs/SuiPage/SuiPage';
import standardNavIcons from '@stoked-ui/docs/components/AppNavIcons';

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
