import * as React from 'react';
import Container from '@mui/material/Container';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import dynamic from 'next/dynamic';

const BillingPage = dynamic(() => import('docs/src/modules/account/BillingPage'), { ssr: false });

export default function BillingRoute() {
  return (
    <BrandingCssVarsProvider>
      <Head title="Billing - Stoked Consulting" description="Review payments, invoices, and payment methods" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <BillingPage />
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
