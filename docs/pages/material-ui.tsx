import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from '@stoked-ui/docs/Layouts/Head';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import AppHeader from '@stoked-ui/docs/Layouts/AppHeader';
import MaterialHero from 'docs/src/components/productMaterial/MaterialHero';
import MaterialComponents from 'docs/src/components/productMaterial/MaterialComponents';
import MaterialTheming from 'docs/src/components/productMaterial/MaterialTheming';
import MaterialStyling from 'docs/src/components/productMaterial/MaterialStyling';
import MaterialTemplates from 'docs/src/components/productMaterial/MaterialTemplates';
import MaterialDesignKits from 'docs/src/components/productMaterial/MaterialDesignKits';
import MaterialEnd from 'docs/src/components/productMaterial/MaterialEnd';
import References, { CORE_CUSTOMERS } from 'docs/src/components/home/References';
import AppFooter from '@stoked-ui/docs/Layouts/AppFooter';
import AppHeaderBanner from '@stoked-ui/docs/banner/AppHeaderBanner';

export default function MaterialUI() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Stoked UI: React components that implement Material Design"
        description="Stoked UI is an open-source React component library that implements Google's Material Design. It's comprehensive and can be used in production out of the box."
        card="/static/social-previews/materialui-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader gitHubRepository="https://github.com/mui/material-ui" />
      <main id="main-content">
        <MaterialHero />
        <References companies={CORE_CUSTOMERS} />
        <Divider />
        <MaterialComponents />
        <Divider />
        <MaterialTheming />
        <Divider />
        <MaterialStyling />
        <Divider />
        <MaterialTemplates />
        <Divider />
        <MaterialDesignKits />
        <Divider />
        <MaterialEnd />
        <Divider />
      </main>
      <AppFooter stackOverflowUrl="https://stackoverflow.com/questions/tagged/material-ui" />
    </BrandingCssVarsProvider>
  );
}
