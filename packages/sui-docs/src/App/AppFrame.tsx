import * as React from 'react';
import { useRouter } from 'next/router';
import { styled, alpha } from '@mui/material/styles';
import NProgress from 'nprogress';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import NProgressBar from '@mui/docs/NProgressBar';
import { debounce } from '@mui/material/utils';
import { useTranslate } from '@mui/docs/i18n';
import AppNavDrawer from './AppNavDrawer';
import AppSettingsDrawer from './AppSettingsDrawer';
import Notifications from '../components/Notifications';
import MarkdownLinks from '../Markdown/MarkdownLinks';
import SkipLink from '../components/SkipLink';
import PageContext from '../components/PageContext';
import AppFrameBanner from '../banner/AppFrameBanner';

// ... (keep the existing styled components and other non-component code)

function NextNProgressBar(): React.ReactElement {
  const router = useRouter();
  React.useEffect(() => {
    const handleRouteChangeStart = (url: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) {
        nProgressStart();
      }
    };

    const handleRouteChangeDone = (url: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) {
        nProgressDone();
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeDone);
    router.events.on('routeChangeError', handleRouteChangeDone);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeDone);
      router.events.off('routeChangeError', handleRouteChangeDone);
    };
  }, [router]);

  return <NProgressBar />;
}

function DeferredAppSearch(): React.ReactElement {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <React.Fragment>
      {mounted ? (
        <React.Suspense fallback={<Box sx={sx} />}>
          <AppSearch sx={sx} />
        </React.Suspense>
      ) : (
        <Box sx={sx} />
      )}
    </React.Fragment>
  );
}

interface AppFrameProps {
  children: React.ReactNode;
  disableDrawer?: boolean;
  className?: string;
  BannerComponent?: React.ComponentType;
}

function AppFrame(props: AppFrameProps): React.ReactElement {
  const { children, disableDrawer = false, className, BannerComponent = AppFrameBanner } = props;
  const t = useTranslate();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const closeDrawer = React.useCallback(() => setMobileOpen(false), []);
  const openDrawer = React.useCallback(() => setMobileOpen(true), []);

  const { activePage } = React.useContext(PageContext);

  const disablePermanent = activePage?.disableDrawer === true || disableDrawer === true;

  return (
    <RootDiv className={className}>
      <NextNProgressBar />
      <CssBaseline />
      <SkipLink />
      <MarkdownLinks />
      <StyledAppBar disablePermanent={disablePermanent}>
        {/* ... (keep the existing JSX) */}
      </StyledAppBar>
      <StyledAppNavDrawer
        disablePermanent={disablePermanent}
        onClose={closeDrawer}
        onOpen={openDrawer}
        mobileOpen={mobileOpen}
      />
      {children}
      <AppSettingsDrawer onClose={() => setSettingsOpen(false)} open={settingsOpen} />
    </RootDiv>
  );
}

export default AppFrame;
