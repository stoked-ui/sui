import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const InvoiceListPage = dynamic(() => import('docs/src/modules/components/InvoiceListPage'), { ssr: false });

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: string; id: string; clientId?: string } | null>(null);
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

export default function InvoiceListRoute() {
  const router = useRouter();
  const { clientId } = router.query;
  const { user, loading } = useAuth();

  const isAdmin = user?.role === 'admin';
  // Admins can view all invoices (no clientId needed) or filter by ?clientId=
  // Clients use their own clientId
  const resolvedClientId = typeof clientId === 'string' ? clientId : user?.clientId;

  return (
    <BrandingCssVarsProvider>
      <Head title="Invoices - Stoked Consulting" description="View invoices" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : !user ? (
            <Box textAlign="center" py={8}>
              Please log in to view invoices.
            </Box>
          ) : isAdmin || resolvedClientId ? (
            <InvoiceListPage clientId={resolvedClientId} />
          ) : (
            <Box textAlign="center" py={8}>
              No invoices to display.
            </Box>
          )}
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
