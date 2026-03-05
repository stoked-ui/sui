import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/router';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';

interface AuthData {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

function CliLoginForm({ onLogin }: { onLogin: (data: AuthData) => void }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
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
      const res = await fetch('/api/auth/google', {
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
          Authorize bstoked CLI
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to authorize the bstoked CLI tool on your machine.
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
            {loading ? 'Authorizing...' : 'Authorize CLI'}
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

export default function CliAuthPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<'login' | 'authorizing' | 'success' | 'error'>('login');
  const [error, setError] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string>('');

  const handleLogin = async (data: AuthData) => {
    const { port, state } = router.query;
    if (!port || !state) {
      setError('Missing CLI callback parameters (port, state). Please retry from the CLI.');
      setStatus('error');
      return;
    }

    setStatus('authorizing');

    try {
      // Exchange the JWT for a persistent API key
      const res = await fetch('/api/auth/cli/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.access_token}`,
        },
        body: JSON.stringify({
          port: Number(port),
          state: String(state),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Authorization failed (${res.status})`);
      }

      const result = await res.json() as { key: string; state: string; user: { email: string } };

      // Redirect to the CLI's local callback server
      setUserEmail(result.user.email);
      window.location.href = `http://127.0.0.1:${port}/callback?key=${encodeURIComponent(result.key)}&state=${encodeURIComponent(String(state))}&email=${encodeURIComponent(result.user.email)}`;
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
      setStatus('error');
    }
  };

  return (
    <BrandingCssVarsProvider>
      <Head title="Authorize CLI - Stoked UI" description="Authorize the bstoked CLI tool" />
      <AppHeader />
      <main id="main-content">
        {status === 'login' && <CliLoginForm onLogin={handleLogin} />}

        {status === 'authorizing' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress />
            <Typography>Generating API key...</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main' }} />
            <Typography variant="h5" fontWeight="bold">CLI Authorized</Typography>
            <Typography color="text.secondary">
              {userEmail ? `Authenticated as ${userEmail}. ` : ''}
              You can close this tab and return to your terminal.
            </Typography>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Alert severity="error" sx={{ maxWidth: 400 }}>{error}</Alert>
          </Box>
        )}
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
