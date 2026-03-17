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
  const { product: productId } = router.query;
  const [loading, setLoading] = React.useState(true);
  const [license, setLicense] = React.useState<AccountLicense | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!productId) return;

    const fetchLicense = async () => {
      try {
        const licenses = await accountApiFetch<AccountLicense[]>('/api/account/licenses');
        const latest = licenses.find(l => l.productId === productId);
        if (latest) {
          setLicense(latest);
          setLoading(false);
        } else {
          // If not found yet, retry a few times (webhook might be slow)
          setTimeout(fetchLicense, 2000);
        }
      } catch (err) {
        console.error('Failed to fetch licenses:', err);
        setLoading(false);
      }
    };

    fetchLicense();
  }, [productId]);

  const handleCopy = () => {
    if (license?.key) {
      navigator.clipboard.writeText(license.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const productDisplayName = license?.productName || (typeof productId === 'string' ? productId.charAt(0).toUpperCase() + productId.slice(1) : 'Flux');

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
        ) : license ? (
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
              {license.key}
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton onClick={handleCopy} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Alert severity="warning">
            We couldn't retrieve your license key automatically. Please check your email or the Licenses section in your account.
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          We've sent a copy of this license key to your email address. It is also saved here in your account for future reference.
        </Typography>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
        <Button
          variant="contained"
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
