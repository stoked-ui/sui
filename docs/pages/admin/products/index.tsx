import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Section from 'docs/src/layouts/Section';
import { BrandingCssVarsProvider } from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';

const ProductsPage = dynamic(() => import('docs/src/modules/components/ProductsPage'), { ssr: false });

function useAuth() {
  const [user, setUser] = React.useState<{ name: string; role: 'admin' | 'client'; id: string; clientId?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);
  return { user, loading };
}

export default function AdminProductsRoute() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace(toAbsoluteSitePath('consulting', '/consulting/login'));
    }
  }, [loading, router, user]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <BrandingCssVarsProvider>
        <Head title="Products - Stoked Consulting" description="Manage products" />
        <AppHeader />
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="Products - Stoked Consulting" description="Manage products" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <ProductsPage />
        </Container>
      </main>
      <Section bg="gradient" cozy />
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
