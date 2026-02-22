import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import dynamic from 'next/dynamic';

const ProductsPage = dynamic(() => import('docs/src/modules/components/ProductsPage'), { ssr: false });

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

export default function ProductsRoute() {
  const user = useAuth();

  return (
    <BrandingCssVarsProvider>
      <Head title="Products - Stoked Consulting" description="Manage products" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {user ? <ProductsPage /> : (
            <Box textAlign="center" py={8}>
              Please log in to view products.
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
