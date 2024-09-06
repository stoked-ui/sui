import * as React from 'react';
import NoSsr from "@mui/material/NoSsr";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Head from "@stoked-ui/docs/Layouts/Head";
import AppHeaderBanner from "@stoked-ui/docs/banner/AppHeaderBanner";
import BrandingCssVarsProvider from '@stoked-ui/docs/branding/BrandingCssVarsProvider';
import dynamic from 'next/dynamic';
import AppFooter from "@stoked-ui/docs/Layouts/AppFooter";
import AppHeader from "@stoked-ui/docs/Layouts/AppHeader";
import getProducts from '../src/products';
import * as featureToggle from '../src/featureToggle';
import NewsletterToast from "../src/components/home/NewsletterToast";
import Hero from "../src/components/home/HeroMain";


function randomHome(homePages: string[]) {
  return homePages[Math.floor(Math.random()*homePages.length)];
}
const PRODUCTS = getProducts();
const homeUrl = randomHome(PRODUCTS.pages);
const RandomHome = dynamic(() => import((`.${homeUrl}main`)), { ssr: false });

export function HomeView({ HomeMain}: { HomeMain: React.ComponentType }){
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
            url: 'https://stokedconsulting.com',
            logo: 'https://stokedconsulting.com/static/logo.png',
            sameAs: ['https://x.com/MUI_hq', 'https://github.com/mui/', 'https://opencollective.com/mui-org',],
          }),
        }}
      />

    </Head>
    <NoSsr>
      <NewsletterToast/>
    </NoSsr>
    <AppHeaderBanner featureToggle={featureToggle}/>
    <AppHeader/>
    <main id="main-content">
      {isClient ? <Main/> : ''}
      {PRODUCTS.previews()}
    </main>
    <AppFooter/>
  </BrandingCssVarsProvider>;
}

let MainView:  React.ComponentType<{}> = function MainView() {
  return (
    <React.Fragment>
      <Hero/>
      <Box sx={{ height: '112px' }}/>
      <Divider/>
    </React.Fragment>
  )
}

export default function Home({ HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={ HomeMain || MainView } />;
}

Home.getInitialProps = async(context: { req: any; query: any; res: any; asPath: any; pathname: any; }) => {
  const { req } = context;
  if (req) {
    if (req.headers?.host?.indexOf('stoked-ui.com')) {
      MainView = RandomHome;
    }
  }
}
