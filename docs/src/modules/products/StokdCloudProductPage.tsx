import * as React from 'react';
import Divider from '@mui/material/Divider';
import { BrandingCssVarsProvider } from '@stoked-ui/docs';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeader from 'docs/src/layouts/AppHeader';
import Head from 'docs/src/modules/components/Head';
import StokdCloudPitch from 'docs/src/modules/products/StokdCloudPitch';

export default function StokdCloudProductPage() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Stokd Cloud - Coding agents that remember why your code exists"
        description="Stokd gives coding agents a version-controlled spec of what must never break — plus the decision history behind every file — so any model ships features without quietly regressing the rest."
      />
      <AppHeader />
      <main id="main-content">
        <StokdCloudPitch />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
