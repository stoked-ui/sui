import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import { useRouter } from 'next/router';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Section from 'docs/src/layouts/Section';
import { useAllProducts } from 'docs/src/products';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
  clientSlug?: string;
  avatarUrl?: string;
};

type AuthData = {
  access_token?: string;
  user: AuthUser;
};

type SessionResponse = {
  authenticated: boolean;
  user: AuthUser;
};

function readStoredAuth(): AuthData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as AuthData;
  } catch {
    return null;
  }
}

export default function ProductFeedbackPage() {
  const router = useRouter();
  const allProducts = useAllProducts();
  const selectableProducts = React.useMemo(
    () => allProducts.live,
    [allProducts],
  );

  const [auth, setAuth] = React.useState<AuthData | null>(null);
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [rating, setRating] = React.useState<number | null>(5);
  const [message, setMessage] = React.useState('');

  const [accountName, setAccountName] = React.useState('');
  const [accountEmail, setAccountEmail] = React.useState('');
  const [accountPassword, setAccountPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [verificationPending, setVerificationPending] = React.useState(false);
  const [verificationRequested, setVerificationRequested] = React.useState(false);

  const [accountLoading, setAccountLoading] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [accountNotice, setAccountNotice] = React.useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [submitNotice, setSubmitNotice] = React.useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    let active = true;

    const stored = readStoredAuth();
    if (stored && active) {
      setAuth(stored);
    }

    fetch(getApiUrl('/api/auth/session'), { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<SessionResponse>;
      })
      .then((session) => {
        if (!active || !session?.authenticated) {
          return;
        }

        setAuth((current) => ({
          access_token: current?.access_token,
          user: session.user,
        }));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (selectableProducts.length === 0) {
      return;
    }

    const requestedProductId = Array.isArray(router.query.p)
      ? router.query.p[0]
      : router.query.p;

    if (
      typeof requestedProductId === 'string'
      && selectableProducts.some((product) => product.id === requestedProductId)
    ) {
      setSelectedProductId(requestedProductId);
      return;
    }

    setSelectedProductId((current) => {
      if (current && selectableProducts.some((product) => product.id === current)) {
        return current;
      }

      return selectableProducts[0].id;
    });
  }, [router.query.p, selectableProducts]);

  const selectedProduct = selectableProducts.find((product) => product.id === selectedProductId) || null;
  const loginHref = React.useMemo(
    () => `/consulting/login?redirect=${encodeURIComponent(router.asPath || '/products/feedback/')}`,
    [router.asPath],
  );

  const handleStartVerification = async () => {
    setAccountLoading(true);
    setAccountNotice(null);

    try {
      const response = await fetch(getApiUrl('/api/products/feedback/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: accountName,
          email: accountEmail,
          password: accountPassword,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((body as { message?: string }).message || 'Failed to send verification code');
      }

      setVerificationRequested(true);
      setVerificationPending(true);
      setAccountNotice({
        severity: 'success',
        message: `Verification code sent to ${(body as { email?: string }).email || accountEmail}.`,
      });
    } catch (error) {
      setAccountNotice({
        severity: 'error',
        message: error instanceof Error ? error.message : 'Failed to send verification code',
      });
    } finally {
      setAccountLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    setAccountLoading(true);
    setAccountNotice(null);

    try {
      const response = await fetch(getApiUrl('/api/products/feedback/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: accountEmail,
          code: verificationCode,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((body as { message?: string }).message || 'Failed to verify email');
      }

      const nextAuth = body as AuthData;
      localStorage.setItem('auth', JSON.stringify(nextAuth));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'auth',
        newValue: JSON.stringify(nextAuth),
      }));
      setAuth(nextAuth);
      setAccountEmail(nextAuth.user.email);
      setVerificationPending(false);
      setAccountNotice({
        severity: 'success',
        message: 'Email verified. You can submit your feedback now.',
      });
    } catch (error) {
      setAccountNotice({
        severity: 'error',
        message: error instanceof Error ? error.message : 'Failed to verify email',
      });
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmitLoading(true);
    setSubmitNotice(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (auth?.access_token) {
        headers.Authorization = `Bearer ${auth.access_token}`;
      }

      const response = await fetch(getApiUrl('/api/products/feedback'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedProductId,
          rating,
          message,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((body as { message?: string }).message || 'Failed to submit feedback');
      }

      setMessage('');
      setRating(5);
      setSubmitNotice({
        severity: 'success',
        message: `Feedback sent for ${selectedProduct?.name || selectedProductId}.`,
      });
    } catch (error) {
      setSubmitNotice({
        severity: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit feedback',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <BrandingCssVarsProvider>
      <Head
        title="Product Feedback - Stoked Consulting"
        description="Share product feedback with a verified account."
      />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: { xs: 4, md: 6 } }}>
          <Stack spacing={3} sx={{ maxWidth: 960, mx: 'auto' }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700}>
                Product Feedback
              </Typography>
              <Typography variant="h2" sx={{ mt: 1, mb: 1, fontSize: { xs: '2rem', md: '2.75rem' } }}>
                Tell us what is working and what is not.
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                Pick a product, rate it from one to five stars, and write whatever you need to say.
                If you are not logged in, create an account and verify your email inline before we accept the submission.
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, rgba(10,24,40,0.8), rgba(10,24,40,0.4))'
                  : 'linear-gradient(180deg, rgba(248,250,252,0.9), rgba(255,255,255,1))',
              }}
            >
              <Stack spacing={3}>
                {submitNotice && (
                  <Alert severity={submitNotice.severity}>
                    {submitNotice.message}
                  </Alert>
                )}

                <TextField
                  select
                  label="Product"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  fullWidth
                >
                  {selectableProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </TextField>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Rating
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Rating
                      name="product-feedback-rating"
                      value={rating}
                      onChange={(_, nextValue) => setRating(nextValue)}
                      size="large"
                    />
                    <Typography color="text.secondary">
                      {rating ? `${rating} / 5` : 'Choose a rating'}
                    </Typography>
                  </Stack>
                </Box>

                <TextField
                  label="Feedback"
                  placeholder="What should we keep, fix, or build next?"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  multiline
                  minRows={7}
                  fullWidth
                />

                <Divider />

                {auth ? (
                  <Stack spacing={2}>
                    <TextField
                      label="Verified email"
                      value={auth.user.email}
                      fullWidth
                      disabled
                      helperText="Feedback will be attached to your signed-in account."
                    />
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!selectedProductId || !rating || message.trim().length < 2 || submitLoading}
                      onClick={handleSubmitFeedback}
                      startIcon={submitLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                    >
                      {submitLoading ? 'Sending feedback...' : 'Send feedback'}
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        Create a verified account to submit
                      </Typography>
                      <Typography color="text.secondary">
                        We only accept feedback from email addresses that complete verification.
                        If you already have an account, <Link href={loginHref}>sign in instead</Link>.
                      </Typography>
                    </Box>

                    {accountNotice && (
                      <Alert severity={accountNotice.severity}>
                        {accountNotice.message}
                      </Alert>
                    )}

                    <TextField
                      label="Name"
                      value={accountName}
                      onChange={(event) => setAccountName(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={accountEmail}
                      onChange={(event) => setAccountEmail(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={accountPassword}
                      onChange={(event) => setAccountPassword(event.target.value)}
                      helperText="Use at least 8 characters."
                      fullWidth
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button
                        variant="contained"
                        onClick={handleStartVerification}
                        disabled={accountLoading}
                        startIcon={accountLoading && !verificationPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                      >
                        {verificationRequested ? 'Resend code' : 'Send verification code'}
                      </Button>
                      <Button
                        variant="outlined"
                        href={loginHref}
                      >
                        Sign in instead
                      </Button>
                    </Stack>

                    {verificationRequested ? (
                      <Stack spacing={2}>
                        <TextField
                          label="Verification code"
                          value={verificationCode}
                          onChange={(event) => setVerificationCode(event.target.value)}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                          helperText="Enter the 6-digit code we emailed you."
                          fullWidth
                        />
                        <Button
                          variant="contained"
                          onClick={handleVerifyAccount}
                          disabled={accountLoading}
                          startIcon={accountLoading && verificationPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                        >
                          Verify email and continue
                        </Button>
                      </Stack>
                    ) : null}
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
