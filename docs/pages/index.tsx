import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { PRODUCTS } from 'docs/src/products';
import BrandingCssVarsProvider from 'docs/src/BrandingCssVarsProvider';
import dynamic from 'next/dynamic';
import AppFooter from "../src/layouts/AppFooter";
import Head from "../src/modules/components/Head";
import NewsletterToast from "../src/components/home/NewsletterToast";
import AppHeaderBanner from "../src/components/banner/AppHeaderBanner";
import AppHeader from "../src/layouts/AppHeader";
import Hero from "../src/components/home/HeroMain";

function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}
const homeUrl = randomHome(PRODUCTS.pages);
const RandomHome = dynamic(() => import((`.${homeUrl}main`)), { ssr: false });

export function HomeView({ HomeMain}: { HomeMain: React.ComponentType }){
  const Main: React.ComponentType = HomeMain || RandomHome;
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

const logoCss =
  `.stoked-font {
    font-family: "Archivo Black", sans-serif;
    font-weight: 400;
    font-style: normal;
  }`;
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
            url: 'https://stokedconsulting.com.com/',
            logo: 'https://stokedconsulting.com/static/logo.png',
            sameAs: ['https://x.com/MUI_hq', 'https://github.com/mui/', 'https://opencollective.com/mui-org',],
          }),
        }}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet"/>
      <style>{logoCss}</style>
    </Head>
    <NoSsr>
      <NewsletterToast/>
    </NoSsr>
    <AppHeaderBanner/>
    <AppHeader/>
    <main id="main-content">
      {isClient ? <Main/> : ''}
      {PRODUCTS.previews()}
    </main>
    <AppFooter/>
  </BrandingCssVarsProvider>;
}
function MainView() {
  return (
    <React.Fragment>
      <Hero/>
      <Box sx={{ height: '112px' }}/>
      <Divider/>
    </React.Fragment>
  )
}
export default function Home({ HomeMain }: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={ HomeMain || MainView } />;
}
