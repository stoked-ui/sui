import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import GradientText from 'docs/src/components/typography/GradientText';
import { Link } from '@stoked-ui/docs';
import { AccountLicense } from 'docs/src/modules/account/accountStore';
import { accountApiFetch } from 'docs/src/modules/account/accountClient';

export default function CheckoutSuccess() {
  const router = useRouter();
  const { product: productId, session_id: sessionId } = router.query;
  const [loading, setLoading] = React.useState(true);
  const [license, setLicense] = React.useState<AccountLicense | null>(null);
  const [licenseKey, setLicenseKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [appOpened, setAppOpened] = React.useState(false);
  const activatedRef = React.useRef(false);

  // Try to fetch the license key via the public session_id endpoint (no auth needed)
  React.useEffect(() => {
    const sid = Array.isArray(sessionId) ? sessionId[0] : sessionId;
    if (!sid) {return;}

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15; // ~30s of polling

    const fetchBySession = async () => {
      try {
        const res = await fetch(`/api/licenses/checkout-complete?session_id=${encodeURIComponent(sid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.key && !cancelled) {
            setLicenseKey(data.key);
            setLoading(false);
          }
          return;
        }
      } catch {
        // ignore, will retry
      }

      attempts += 1;
      if (attempts < maxAttempts && !cancelled) {
        setTimeout(fetchBySession, 2000);
      } else if (!cancelled) {
        setLoading(false);
      }
    };

    fetchBySession();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Fallback: also try authenticated account API
  React.useEffect(() => {
    const id = Array.isArray(productId) ? productId[0] : productId;
    if (!id) {return;}

    const fetchLicense = async () => {
      try {
        const licenses = await accountApiFetch<AccountLicense[]>('/api/account/licenses');
        const latest = licenses.find(l => l.productId === id);
        if (latest) {
          setLicense(latest);
          if (!licenseKey) {
            setLicenseKey(latest.key);
          }
          setLoading(false);
        } else {
          setTimeout(fetchLicense, 2000);
        }
      } catch (err) {
        console.error('Failed to fetch licenses:', err);
      }
    };

    fetchLicense();
  }, [productId, licenseKey]);

  // Auto-open the app when we have the key
  React.useEffect(() => {
    if (!licenseKey || activatedRef.current) {return;}
    activatedRef.current = true;

    const activateUrl = `flux://activate-license?key=${encodeURIComponent(licenseKey)}`;
    window.location.href = activateUrl;
    setAppOpened(true);
  }, [licenseKey]);

  const handleCopy = () => {
    const key = licenseKey || license?.key;
    if (key) {
      navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenApp = () => {
    const key = licenseKey || license?.key;
    if (key) {
      window.location.href = `flux://activate-license?key=${encodeURIComponent(key)}`;
      setAppOpened(true);
    }
  };

  const displayKey = licenseKey || license?.key;
  const idForDisplay = Array.isArray(productId) ? productId[0] : productId;
  const productDisplayName = license?.productName || (typeof idForDisplay === 'string' ? idForDisplay.charAt(0).toUpperCase() + idForDisplay.slice(1) : 'Flux');

  return (
    <Box sx={{ py: 8, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h2" gutterBottom>
        <GradientText>Thank you!</GradientText>
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
        Your 12 month subscription of {productDisplayName} is now active.
      </Typography>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: 'left', mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          YOUR LICENSE KEY
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Generating your license key...
            </Typography>
          </Box>
        ) : displayKey ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                p: 1.5,
                borderRadius: 1,
                flexGrow: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {displayKey}
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton onClick={handleCopy} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Alert severity="warning">
            We couldn&apos;t retrieve your license key automatically. Please check your email or the Licenses section in your account.
          </Alert>
        )}

        {appOpened && displayKey && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Activating your license in Flux...
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          We&apos;ve sent a copy of this license key to your email address. It is also saved here in your account for future reference.
        </Typography>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
        {displayKey && (
          <Button
            variant="contained"
            size="large"
            onClick={handleOpenApp}
          >
            Open in {productDisplayName}
          </Button>
        )}
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href={license?.productUrl || (typeof productId === 'string' ? `/products/${productId}` : '/')}
        >
          Go to {productDisplayName} Docs
        </Button>
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href="/consulting/licenses"
        >
          Manage Licenses
        </Button>
      </Stack>
    </Box>
  );
}
