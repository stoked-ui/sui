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
import { useRouter } from 'next/router';
import { toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';
import dynamic from 'next/dynamic';

import { GetStaticPaths, GetStaticProps } from 'next';

const ProductDetailPage = dynamic(() => import('docs/src/modules/components/ProductDetailPage'), { ssr: false });

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: process.env.OPEN_NEXT_BUILD === 'true' ? 'blocking' : false,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

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

export default function AdminProductDetailRoute() {
  const router = useRouter();
  const productSlug = router.query['product-slug'];
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace(toAbsoluteSitePath('consulting', '/consulting/login'));
    }
  }, [loading, router, user]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <BrandingCssVarsProvider>
        <Head title="Product Details - Stoked Consulting" description="View and manage product details" />
        <AppHeader />
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      </BrandingCssVarsProvider>
    );
  }

  return (
    <BrandingCssVarsProvider>
      <Head title="Product Details - Stoked Consulting" description="View and manage product details" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          {typeof productSlug === 'string' ? (
            <ProductDetailPage productSlug={productSlug} />
          ) : (
            <Box textAlign="center" py={8}>
              Product not found.
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
