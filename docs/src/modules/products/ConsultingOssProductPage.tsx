import * as React from 'react';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BrandingCssVarsProvider, Link } from '@stoked-ui/docs';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Head from 'docs/src/modules/components/Head';
import { consultingOssProduct } from 'docs/src/modules/products/consultingOssProducts';

export default function ConsultingOssProductPage({ productId }: { productId: string }) {
  const product = consultingOssProduct(productId);
  const name = product?.name ?? productId;
  const description = product?.description ?? '';

  return (
    <BrandingCssVarsProvider>
      <Head title={`${name} – Products`} description={description} />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: { xs: 6, md: 10 }, maxWidth: 760 }}>
          <Stack spacing={2} sx={{ maxWidth: 640 }}>
            <Chip
              label="Open source"
              size="small"
              variant="outlined"
              sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
            />
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              {name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.125rem', maxWidth: '62ch' }}>
              {description}
            </Typography>
            <Link href="/products/" sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
              All products
            </Link>
          </Stack>
        </Container>
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
