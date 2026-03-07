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

interface AuthData {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'client';
    clientId?: string;
    avatarUrl?: string;
  };
}

function resolveRedirectTarget(raw: string | string[] | undefined): string | null {
  const target = Array.isArray(raw) ? raw[0] : raw;
  if (!target) {
    return null;
  }
  if (!target.startsWith('/') || target.startsWith('//')) {
    return null;
  }
  if (target.startsWith('/consulting/login')) {
    return null;
  }
  return target;
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

  const defaultRouteForUser = React.useCallback((user: AuthData['user']) => {
    if (user.role === 'admin') {
      return '/consulting/clients';
    }
    return `/consulting/clients/${user.clientId}`;
  }, []);

  const postLoginRouteForUser = React.useCallback(
    (user: AuthData['user']) => redirectTarget || defaultRouteForUser(user),
    [defaultRouteForUser, redirectTarget],
  );

  React.useEffect(() => {
    if (!router.isReady) {
      return;
    }
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored) as AuthData;
        setAuth(parsed);
        // Already logged in — redirect to the requested route if provided.
        router.replace(postLoginRouteForUser(parsed.user));
        return;
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [postLoginRouteForUser, router, router.isReady]);

  const handleLogin = (data: AuthData) => {
    try {
      localStorage.setItem('auth', JSON.stringify(data));
      localStorage.setItem('blog_jwt', data.access_token);
    } catch { /* ignore */ }
    setAuth(data);
    router.push(postLoginRouteForUser(data.user));
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
