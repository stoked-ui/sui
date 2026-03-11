import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: string; id: string } | null>(null);
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

export default function PartnerPage() {
  const router = useRouter();
  const { partnerName } = router.query;
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/consulting/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <BrandingCssVarsProvider>
        <Head title="Partner - Stoked Consulting" description="Partner portal" />
        <AppHeader />
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </BrandingCssVarsProvider>
    );
  }

  const displayName = typeof partnerName === 'string'
    ? partnerName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <BrandingCssVarsProvider>
      <Head title={`${displayName} - Partner Portal`} description="Partner portal" />
      <AppHeader />
      <main id="main-content">
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {displayName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Partner portal — coming soon.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This space will be customized for partner-specific content, co-branded materials, and shared project access.
            </Typography>
          </Box>
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
