import * as React from 'react';
import Divider from '@mui/material/Divider';
import AppHeader from '@stoked-ui/docs/Layouts/AppHeader';
import AppFooter from '@stoked-ui/docs/Layouts/AppFooter';
import AboutHero from 'docs/src/components/about/AboutHero';
import OurValues from 'docs/src/components/about/OurValues';
import Team from 'docs/src/components/about/Team';
import HowToSupport from 'docs/src/components/about/HowToSupport';
import AboutEnd from 'docs/src/components/about/AboutEnd';
import Head from '@stoked-ui/docs/Layouts/Head';
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import AppHeaderBanner from '@stoked-ui/docs/banner/AppHeaderBanner';

export default function About() {
  return (
    <BrandingCssVarsProvider>
      <Head
        title="About us - SUI"
        description="SUI is a 100% remote globally distributed team, supported by a community of thousands
        of developers all across the world."
        card="/static/social-previews/about-preview.jpg"
      />
      <AppHeaderBanner />
      <AppHeader />
      <main id="main-content">
        <AboutHero />
        <Divider />
        <OurValues />
        <Divider />
        <Team />
        <Divider />
      </main>
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
