import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/router';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import Head from 'docs/src/modules/components/Head';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import {
  STOKED_CONSULTING_CDN_ORIGIN,
  STOKED_CONSULTING_ORIGIN,
  STOKED_UI_ORIGIN,
} from 'docs/src/modules/utils/siteRouting';

interface AuthData {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    clientId?: string;
    clientSlug?: string;
    avatarUrl?: string;
  };
}

interface SessionResponse {
  authenticated: boolean;
  user: AuthData['user'];
}

function isAllowedAbsoluteRedirect(target: string) {
  if (/^http:\/\/localhost:\d+/i.test(target)) {
    return true;
  }

  try {
    const url = new URL(target);
    return url.origin === STOKED_UI_ORIGIN
      || url.origin === STOKED_CONSULTING_ORIGIN
      || url.origin === STOKED_CONSULTING_CDN_ORIGIN;
  } catch {
    return false;
  }
}

function resolveRedirectTarget(raw: string | string[] | undefined): string | null {
  const target = Array.isArray(raw) ? raw[0] : raw;
  if (!target) {
    return null;
  }

  if (target.startsWith('/')) {
    if (target.startsWith('//') || target.startsWith('/consulting/login')) {
      return null;
    }
    return target;
  }

  if (!isAllowedAbsoluteRedirect(target)) {
    return null;
  }

  try {
    const url = new URL(target);
    if (url.pathname.startsWith('/consulting/login')) {
      return null;
    }
  } catch {
    return null;
  }

  return target;
}

function navigateToTarget(router: ReturnType<typeof useRouter>, target: string) {
  if (/^https?:\/\//i.test(target)) {
    window.location.assign(target);
    return;
  }

  router.push(target);
}

function buildPostAuthTarget(target: string) {
  if (!/^https?:\/\//i.test(target)) {
    return target;
  }

  const currentOrigin = window.location.origin;
  const parsedTarget = new URL(target);
  if (parsedTarget.origin === currentOrigin) {
    return target;
  }

  const transferUrl = new URL('/api/auth/transfer', currentOrigin);
  transferUrl.searchParams.set('targetOrigin', parsedTarget.origin);
  transferUrl.searchParams.set('returnTo', target);
  return transferUrl.toString();
}

function navigateAfterAuth(router: ReturnType<typeof useRouter>, target: string) {
  navigateToTarget(router, buildPostAuthTarget(target));
}

function LoginForm({ onLogin }: { onLogin: (data: AuthData) => void }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Login failed (${res.status})`);
      }
      const data = (await res.json()) as AuthData;
      onLogin(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError('No credential received from Google');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: idToken }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Google login failed (${res.status})`);
      }
      const data = (await res.json()) as AuthData;
      onLogin(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const showGoogleLogin = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to access the consulting portal.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
        {showGoogleLogin && (
          <React.Fragment>
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">or</Typography>
            </Divider>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed')}
              />
            </Box>
          </React.Fragment>
        )}
      </Paper>
    </Box>
  );
}

export default function ConsultingLoginPage() {
  const router = useRouter();
  const [auth, setAuth] = React.useState<AuthData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const redirectTarget = React.useMemo(
    () => resolveRedirectTarget(router.query.redirect),
    [router.query.redirect],
  );

  const defaultRouteForUser = React.useCallback((u: AuthData['user']) => {
    switch (u.role) {
      case 'admin':
        return '/consulting/admin';
      case 'client':
        return `/consulting/clients/${u.clientSlug || u.clientId}`;
      case 'agent':
        // Agents land where the user they're attached to would land
        return `/consulting/clients/${u.clientSlug || u.clientId || ''}`;
      case 'subscriber':
      case 'stokd member':
        return '/consulting/customer';
      case 'totally stoked':
      default:
        return '/consulting/groupies';
    }
  }, []);

  const postLoginRouteForUser = React.useCallback(
    (user: AuthData['user']) => redirectTarget || defaultRouteForUser(user),
    [defaultRouteForUser, redirectTarget],
  );

  React.useEffect(() => {
    if (!router.isReady) {
      return;
    }

    fetch(getApiUrl('/api/auth/session'), { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<SessionResponse>;
      })
      .then((session) => {
        if (session?.authenticated) {
          setAuth({ access_token: '', user: session.user });
          navigateAfterAuth(router, postLoginRouteForUser(session.user));
          return;
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [postLoginRouteForUser, router, router.isReady]);

  const handleLogin = (data: AuthData) => {
    try {
      localStorage.setItem('auth', JSON.stringify(data));
      localStorage.setItem('blog_jwt', data.access_token);
    } catch { /* ignore */ }
    setAuth(data);
    navigateAfterAuth(router, postLoginRouteForUser(data.user));
  };

  if (loading || auth) {
    return (
      <BrandingCssVarsProvider>
        <Head title="Login - Stoked Consulting" description="Sign in to the consulting portal" />
        <AppHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="Login - Stoked Consulting" description="Sign in to the consulting portal" />
      <AppHeader />
      <main id="main-content">
        <LoginForm onLogin={handleLogin} />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
