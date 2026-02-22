import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const InvoiceListPage = dynamic(() => import('docs/src/modules/components/InvoiceListPage'), { ssr: false });

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

export default function InvoiceListRoute() {
  const router = useRouter();
  const { clientId } = router.query;
  const user = useAuth();

  // For client users, use their own clientId
  const resolvedClientId = typeof clientId === 'string' ? clientId : user?.clientId;

  return (
    <BrandingCssVarsProvider>
      <Head title="Invoices - Stoked Consulting" description="View invoices" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {user && resolvedClientId ? (
            <InvoiceListPage clientId={resolvedClientId} />
          ) : (
            <Box textAlign="center" py={8}>
              Please log in to view invoices.
            </Box>
          )}
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
