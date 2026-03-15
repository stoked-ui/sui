import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import GitHubIcon from '@mui/icons-material/GitHub';
import LoginIcon from '@mui/icons-material/LoginOutlined';
import { useRouter } from 'next/router';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import ThemeModeToggle from 'docs/src/components/header/ThemeModeToggle';
import { Link } from '@stoked-ui/docs';
import { DeferredAppSearch } from 'docs/src/modules/components/AppFrame';
import { useTranslate } from '@stoked-ui/docs/i18n';
import { UserMenu } from '@stoked-ui/common';
import SvgSuiLogomark from "docs/src/icons/SvgSuiLogomark";
import SvgScLogo from "docs/src/icons/SvgScLogo"
import HeaderNavBar from 'docs/src/components/header/HeaderNavBar';
import HeaderNavDropdown from 'docs/src/components/header/HeaderNavDropdown';
import {
  STOKED_CONSULTING_ORIGIN,
  STOKED_UI_ORIGIN,
  toAbsoluteSitePath,
} from 'docs/src/modules/utils/siteRouting';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
  clientSlug?: string;
  avatarUrl?: string;
}

interface AuthData {
  access_token: string;
  user: AuthUser;
}

export interface ManagedProduct {
  _id: string;
  productId: string;
  name: string;
  description: string;
  url: string;
  features?: Array<{ name: string; description: string; id: string }>;
  icon?: string;
  hideProductFeatures?: boolean;
  prerelease?: 'alpha' | 'beta' | 'none';
}

const Header = styled('header')(({ theme }) => {
  return [
    {
      position: 'sticky',
      top: 0,
      transition: theme.transitions.create('top'),
      zIndex: theme.zIndex.appBar,
      backdropFilter: 'blur(8px)',
      boxShadow: `inset 0px -1px 1px ${theme.palette.grey[100]}`,
      backgroundColor: 'rgba(255,255,255,0.8)',
    } as const,
    theme.applyDarkStyles({
      boxShadow: `inset 0px -1px 1px ${theme.palette.primaryDark[700]}`,
      backgroundColor: alpha(theme.palette.primaryDark[900], 0.7),
    }),
  ]
});

const HEIGHT = 60;

interface AppHeaderProps {
  gitHubRepository?: string;
}

export default function AppHeader(props: AppHeaderProps) {
  const { gitHubRepository = 'https://github.com/stoked-ui/sui' } = props;
  const t = useTranslate();
  const router = useRouter();
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [managedProducts, setManagedProducts] = React.useState<ManagedProduct[]>([]);

  React.useEffect(() => {
    fetch(getApiUrl('/api/products/public'))
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setManagedProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    let active = true;

    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored) as AuthData;
        if (active) {
          setAuthUser(parsed.user);
        }
      }
    } catch { /* ignore */ }

    fetch(getApiUrl('/api/auth/session'), { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{ authenticated: boolean; user: AuthUser }>;
      })
      .then((session) => {
        if (!active) {
          return;
        }

        setAuthUser(session?.authenticated ? session.user : null);
      })
      .catch(() => {
        if (active) {
          setAuthUser((current) => current);
        }
      });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'auth') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as AuthData;
            setAuthUser(parsed.user);
          } catch { /* ignore */ }
        } else {
          setAuthUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      active = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const buildLogoutUrl = React.useCallback(() => {
    if (typeof window === 'undefined') {
      return '/api/auth/logout?returnTo=/';
    }

    const currentOrigin = window.location.origin;
    const logoutUrl = new URL('/api/auth/logout', currentOrigin);
    logoutUrl.searchParams.set('returnTo', `${currentOrigin}/`);

    if (currentOrigin === STOKED_UI_ORIGIN) {
      logoutUrl.searchParams.set('nextOrigin', STOKED_CONSULTING_ORIGIN);
    } else if (currentOrigin === STOKED_CONSULTING_ORIGIN) {
      logoutUrl.searchParams.set('nextOrigin', STOKED_UI_ORIGIN);
    }

    return logoutUrl.toString();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth');
      localStorage.removeItem('blog_jwt');
    } catch { /* ignore */ }
    setAuthUser(null);

    if (typeof window !== 'undefined') {
      window.location.assign(buildLogoutUrl());
      return;
    }

    router.push('/');
  };

  const isConsultingPage = router.pathname.startsWith('/consulting');

  return (
    <Header>
      <GlobalStyles
        styles={{
          ':root': {
            '--MuiDocs-header-height': `${HEIGHT}px`,
          },
        }}
      />
      <Container sx={{ display: 'flex', alignItems: 'center', minHeight: HEIGHT }}>
        <Box component={Link} href="/" aria-label="Go to homepage" sx={{ lineHeight: 0, mr: 2 }}>
          {isConsultingPage ? <SvgScLogo width={30} /> : <SvgSuiLogomark width={30} />}
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'initial' } }}>
          <HeaderNavBar auth={authUser} managedProducts={managedProducts} />
        </Box>
        <Box sx={{ ml: 'auto' }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <DeferredAppSearch />
          <Tooltip title={t('appFrame.github')} enterDelay={300}>
            <IconButton
              component="a"
              color="primary"
              href={gitHubRepository}
              target="_blank"
              rel="noopener"
              data-ga-event-category="header"
              data-ga-event-action="github"
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <ThemeModeToggle />
          {authUser ? (
            <UserMenu
              name={authUser.name}
              role={authUser.role}
              avatarUrl={authUser.avatarUrl}
              onSettings={() => router.push(toAbsoluteSitePath('consulting', '/consulting/settings'))}
              onLicenses={() => router.push(toAbsoluteSitePath('consulting', '/consulting/licenses'))}
              onBilling={() => router.push(toAbsoluteSitePath('consulting', '/consulting/billing'))}
              onSignOut={handleLogout}
            />
          ) : (
            <Tooltip title="Login" enterDelay={300}>
              <IconButton
                component={Link}
                href={toAbsoluteSitePath('consulting', '/consulting/login')}
                color="primary"
                data-ga-event-category="header"
                data-ga-event-action="login"
              >
                <LoginIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Box sx={{ display: { md: 'none' }, ml: 1 }}>
          <HeaderNavDropdown auth={authUser} managedProducts={managedProducts} />
        </Box>
      </Container>
    </Header>
  );
}
