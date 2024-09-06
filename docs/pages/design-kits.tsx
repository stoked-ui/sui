import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from '@stoked-ui/docs/Layouts/Head';
import AppHeader from '@stoked-ui/docs/Layouts/AppHeader';
import AppFooter from '@stoked-ui/docs/Layouts/AppFooter';
import DesignKitHero from 'docs/src/components/productDesignKit/DesignKitHero';
import DesignKitValues from 'docs/src/components/productDesignKit/DesignKitValues';
import DesignKitDemo from 'docs/src/components/productDesignKit/DesignKitDemo';
import DesignKitFAQ from 'docs/src/components/productDesignKit/DesignKitFAQ';
import SyncFeatures from 'docs/src/components/productDesignKit/SyncFeatures';
import MaterialEnd from 'docs/src/components/productMaterial/MaterialEnd';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import References, { DESIGNKITS_CUSTOMERS } from 'docs/src/components/home/References';
import AppHeaderBanner from '@stoked-ui/docs/banner/AppHeaderBanner';

export default function DesignKits() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Stoked UI in your favorite design tool"
        description="Pick your favorite design tool to enjoy and use Stoked UI components. Boost consistency and facilitate communication when working with developers."
        card="/static/social-previews/designkits-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader gitHubRepository="https://github.com/mui/mui-design-kits" />
      <main id="main-content">
        <DesignKitHero />
        <References companies={DESIGNKITS_CUSTOMERS} />
        <Divider />
        <DesignKitValues />
        <Divider />
        <DesignKitDemo />
        <Divider />
        <SyncFeatures />
        <Divider />
        <DesignKitFAQ />
        <Divider />
        <MaterialEnd noFaq />
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
