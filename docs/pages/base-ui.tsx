import * as React from 'react';
import Divider from '@mui/material/Divider';
import Head from 'docs/src/modules/components/Head';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppFooter from 'docs/src/layouts/AppFooter';
import AppHeaderBanner from 'docs/src/components/banner/AppHeaderBanner';
import BaseUIHero from 'docs/src/components/productBaseUI/BaseUIHero';
import BaseUISummary from 'docs/src/components/productBaseUI/BaseUISummary';
import BaseUIComponents from 'docs/src/components/productBaseUI/BaseUIComponents';
import BaseUICustomization from 'docs/src/components/productBaseUI/BaseUICustomization';
import BaseUIEnd from 'docs/src/components/productBaseUI/BaseUIEnd';
import BaseUITestimonial from 'docs/src/components/productBaseUI/BaseUITestimonial';

export default function Core() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Base UI: Ship accessible & sleek components"
        description='Base UI gives you a set of foundational \"headless\" components that you can build with using any styling solution you choose—no need to override any default style engine or theme.'
        card="/static/blog/introducing-mui-base/card.png"
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <AppHeaderBanner />
      <AppHeader gitHubRepository="https://github.com/mui/material-ui" />
      <main id="main-content">
        <BaseUIHero />
        <BaseUISummary />
        <Divider />
        <BaseUIComponents />
        <Divider />
        <BaseUICustomization />
        <Divider />
        <BaseUITestimonial />
        <Divider />
        <BaseUIEnd />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
