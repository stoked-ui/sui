import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from '@stoked-ui/docs/Layouts/Head';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import AppHeader from '@stoked-ui/docs/Layouts/AppHeader';
import AppFooter from '@stoked-ui/docs/Layouts/AppFooter';
import AppHeaderBanner from '@stoked-ui/docs/banner/AppHeaderBanner';
import NotFoundHero from 'docs/src/components/NotFoundHero';

export default function Custom404() {
  return (
    <BrandingCssVarsProvider>
      <Head title="404: This page could not be found - SUI" description="" />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <NotFoundHero />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
