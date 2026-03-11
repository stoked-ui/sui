import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import VpnKeyIcon from '@mui/icons-material/VpnKeyOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: string; id: string; email: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        setUser(JSON.parse(stored).user);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);
  return { user, loading };
}

const roleLabel: Record<string, string> = {
  subscriber: 'Subscriber',
  'stokd member': 'Stokd Member',
};

export default function CustomerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/consulting/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <BrandingCssVarsProvider>
        <Head title="My Account - Stoked Consulting" description="Your products and subscriptions" />
        <AppHeader />
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="My Account - Stoked Consulting" description="Your products and subscriptions" />
      <AppHeader />
      <main id="main-content">
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Welcome, {user.name}
              </Typography>
              <Chip
                label={roleLabel[user.role] || user.role}
                color="primary"
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>

          <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <VpnKeyIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Licenses</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage your active software licenses.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => router.push('/consulting/licenses')}>
                Manage licenses
              </Button>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <DownloadIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Products</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Browse available products and your purchased downloads.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => router.push('/consulting/products')}>
                View products
              </Button>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Billing</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View billing history and manage your subscription.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => router.push('/consulting/billing')}>
                View billing
              </Button>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Settings</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Update your profile, notification preferences, and account settings.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => router.push('/consulting/settings')}>
                Account settings
              </Button>
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
