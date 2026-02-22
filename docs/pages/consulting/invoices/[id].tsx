import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const InvoiceDetailPage = dynamic(() => import('docs/src/modules/components/InvoiceDetailPage'), { ssr: false });

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: 'admin' | 'client'; id: string; clientId?: string } | null>(null);
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

export default function InvoiceDetailRoute() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuth();

  return (
    <BrandingCssVarsProvider>
      <Head title="Invoice Details - Stoked Consulting" description="View invoice details" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {user && typeof id === 'string' ? (
            <InvoiceDetailPage invoiceId={id} />
          ) : (
            <Box textAlign="center" py={8}>
              Please log in to view invoice details.
            </Box>
          )}
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
