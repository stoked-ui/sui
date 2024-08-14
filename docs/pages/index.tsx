import * as React from 'react';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import { PRODUCTS } from 'docs/src/products';
import NoSsr from "@mui/material/NoSsr";
import dynamic from 'next/dynamic';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";

function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}
const homeUrl = randomHome(PRODUCTS.pages);
const RandomHome = dynamic(() => import((`.${homeUrl}main`)), { ssr: false });

export default function Home({ HomeMain }: { HomeMain: React.ComponentType }) {
  const Main: React.ComponentType = HomeMain || RandomHome;
  const [isClient, setIsClient] = React.useState(false)


  React.useEffect(() => {
    setIsClient(true)
  }, [])


  return <BrandingCssVarsProvider>
    <Head
      title="Stoked UI: React Media Components"
      description="Stoked UI provides a customizable, and accessible library of React media components."
      card="/static/social-previews/home-preview.jpg"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Stoked UI',
            url: 'https://stoked-ui.github.io.com/',
            logo: 'https://stoked-ui.github.io/static/logo.png',
            sameAs: [
              'https://x.com/MUI_hq',
              'https://github.com/mui/',
              'https://opencollective.com/mui-org',
            ],
          }),
        }}
      />
    </Head>
    <NoSsr>
      <NewsletterToast />
    </NoSsr>
    <AppHeaderBanner />
    <AppHeader />
    <main id="main-content">
      {isClient ? <Main /> : ''}
      {PRODUCTS.previews()}
    </main>
    <AppFooter />
  </BrandingCssVarsProvider>;
}
