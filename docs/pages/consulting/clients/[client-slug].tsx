import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

const ClientDetailPage = dynamic(() => import('docs/src/modules/components/ClientDetailPage'), { ssr: false });

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: string; id: string; clientId?: string; clientSlug?: string } | null>(null);
  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
      } catch { /* ignore */ }
    }
  }, []);
  return user;
}

export default function ClientDetailRoute() {
  const router = useRouter();
  const slug = router.query['client-slug'];
  const user = useAuth();
  const [clientId, setClientId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (!router.isReady || !slug || typeof slug !== 'string') return;
    const stored = localStorage.getItem('auth');
    if (!stored) {
      setLoading(false);
      return;
    }
    let token: string;
    try {
      token = JSON.parse(stored).access_token;
    } catch {
      setLoading(false);
      return;
    }
    fetch(getApiUrl(`/api/clients/${slug}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Not found'))))
      .then((client: { _id: string }) => {
        setClientId(client._id);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [router.isReady, slug]);

  return (
    <BrandingCssVarsProvider>
      <Head title="Client Details - Stoked Consulting" description="View client details and deliverables" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : user && clientId ? (
            <ClientDetailPage clientId={clientId} />
          ) : (
            <Box textAlign="center" py={8}>
              {!user ? 'Please log in to view client details.' : notFound ? 'Client not found.' : 'Unable to load client.'}
            </Box>
          )}
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
