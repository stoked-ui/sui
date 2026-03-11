import * as React from 'react';
import Container from '@mui/material/Container';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import dynamic from 'next/dynamic';

const LicensesPage = dynamic(() => import('docs/src/modules/account/LicensesPage'), { ssr: false });

export default function LicensesRoute() {
  return (
    <BrandingCssVarsProvider>
      <Head title="Licenses - Stoked Consulting" description="Review your license plans and subscriptions" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <LicensesPage />
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
