import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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

export default function CliAuthPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<'checking' | 'authorizing' | 'success' | 'error'>('checking');
  const [error, setError] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string>('');
  const hasStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (!router.isReady || hasStartedRef.current) {
      return;
    }

    const port = Number(router.query.port);
    const state = typeof router.query.state === 'string' ? router.query.state : '';
    if (!Number.isFinite(port) || port <= 0 || !state) {
      hasStartedRef.current = true;
      setError('Missing CLI callback parameters (port, state). Please retry from the CLI.');
      setStatus('error');
      return;
    }

    let auth: AuthData | null = null;
    try {
      const stored = localStorage.getItem('auth');
      auth = stored ? (JSON.parse(stored) as AuthData) : null;
    } catch {
      auth = null;
    }

    const token = auth?.access_token;
    if (!token) {
      const redirect = encodeURIComponent(router.asPath || '/cli/auth');
      router.replace(`/consulting/login?redirect=${redirect}`);
      return;
    }

    hasStartedRef.current = true;
    setStatus('authorizing');

    const run = async () => {
      try {
        const res = await fetch('/api/auth/cli/authorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ port, state }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error((json as { message?: string }).message || `Authorization failed (${res.status})`);
        }

        const result = await res.json() as {
          key: string;
          state: string;
          user: {
            email: string;
            role?: string;
            clientId?: string;
          };
        };

        setUserEmail(result.user.email);
        const role = result.user.role;
        const clientId = result.user.clientId;
        const callbackUrl = new URL(`http://127.0.0.1:${port}/callback`);
        callbackUrl.searchParams.set('key', result.key);
        callbackUrl.searchParams.set('state', state);
        callbackUrl.searchParams.set('email', result.user.email);
        if (role) {
          callbackUrl.searchParams.set('role', role);
        }
        if (clientId) {
          callbackUrl.searchParams.set('client_id', clientId);
        }
        window.location.href = callbackUrl.toString();
        setStatus('success');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Authorization failed');
        setStatus('error');
      }
    };
    run();
  }, [router]);

  return (
    <BrandingCssVarsProvider>
      <Head title="Authorize CLI - Stoked UI" description="Authorize the stoked CLI tool" />
      <AppHeader />
      <main id="main-content">
        {status === 'checking' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress />
            <Typography>Checking authentication...</Typography>
          </Box>
        )}

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
