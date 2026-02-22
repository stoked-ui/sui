import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Section from 'docs/src/layouts/Section';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ProductDetailPage = dynamic(() => import('docs/src/modules/components/ProductDetailPage'), { ssr: false });

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

export default function ProductDetailRoute() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuth();

  return (
    <BrandingCssVarsProvider>
      <Head title="Product Details - Stoked Consulting" description="View product details and documentation pages" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {user && typeof id === 'string' ? (
            <ProductDetailPage productId={id} />
          ) : (
            <Box textAlign="center" py={8}>
              Please log in to view product details.
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
