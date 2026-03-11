import * as React from 'react';
import Container from '@mui/material/Container';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Head from 'docs/src/modules/components/Head';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import dynamic from 'next/dynamic';

const SettingsPage = dynamic(() => import('docs/src/modules/account/SettingsPage'), { ssr: false });

export default function SettingsRoute() {
  return (
    <BrandingCssVarsProvider>
      <Head title="Settings - Stoked Consulting" description="Manage your account settings" />
      <AppHeader />
      <main id="main-content">
        <Container sx={{ py: 4 }}>
          <SettingsPage />
        </Container>
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
