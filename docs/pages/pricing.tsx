import * as React from 'react';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Head from '@stoked-ui/docs/Layouts/Head';
import AppHeader from '@stoked-ui/docs/Layouts/AppHeader';
import HeroPricing from 'docs/src/components/pricing/HeroPricing';
import PricingTable from 'docs/src/components/pricing/PricingTable';
import PricingList from 'docs/src/components/pricing/PricingList';
import Testimonials from 'docs/src/components/home/Testimonials';
import PricingWhatToExpect from 'docs/src/components/pricing/PricingWhatToExpect';
import PricingFAQ from 'docs/src/components/pricing/PricingFAQ';
import HeroEnd from 'docs/src/components/home/HeroEnd';
import AppFooter from '@stoked-ui/docs/Layouts/AppFooter';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import AppHeaderBanner from '@stoked-ui/docs/banner/AppHeaderBanner';
import { LicensingModelProvider } from 'docs/src/components/pricing/LicensingModelContext';

export default function Pricing() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="Pricing - SUI"
        description="The community edition lets you get going right away. Switch to a commercial plan for more components & technical support."
        card="/static/social-previews/pricing-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <HeroPricing />
        <Divider />
        <LicensingModelProvider>
          {/* Mobile, Tablet */}
          <Container sx={{ display: { xs: 'block', md: 'none' }, pb: 3, mt: '-1px' }}>
            <PricingList />
          </Container>
          {/* Desktop */}
          <Container sx={{ display: { xs: 'none', md: 'block' } }}>
            <PricingTable />
          </Container>
        </LicensingModelProvider>
        <PricingWhatToExpect />
        <Divider />
        <PricingFAQ />
        <Divider />
        <Testimonials />
        <Divider />
        <HeroEnd />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
