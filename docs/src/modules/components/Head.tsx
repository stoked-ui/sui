import * as React from 'react';
import NextHead from 'next/head';
import { useRouter } from 'next/router';
import { useUserLanguage, useTranslate } from '@mui/docs/i18n';
import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import PageContext from "docs/src/modules/components/PageContext";

// #major-version-switch
const HOST = process.env.PULL_REQUEST_ID
  ? `https://deploy-preview-${process.env.PULL_REQUEST_ID}--${process.env.NETLIFY_SITE_NAME}.netlify.app`
  : 'https://stokedconsulting.com';

interface HeadProps {
  card?: string;
  children?: React.ReactNode;
  description: string;
  disableAlternateLocale?: boolean;
  largeCard?: boolean;
  title: string;
  type?: string;
}

export default function Head(props: HeadProps) {
  const t = useTranslate();
  const { languages } = React.useContext(PageContext);
  const {
    card = '/static/social-previews/home-preview.jpg',
    children,
    description = t('strapline'),
    disableAlternateLocale = false,
    largeCard = true,
    title = t('headTitle'),
    type = 'website',
  } = props;
  const userLanguage = useUserLanguage();
  const router = useRouter();
  const { canonicalAs } = pathnameToLanguage(router.asPath);
  const preview = card.startsWith('http') ? card : `${HOST}${card}`;
  const logoCss = `
  .stoked-font {
    font-family: "ArchivoBlack-Regular", sans-serif;
    font-weight: 400;
    line-height: .8;
  }`;
  return (<NextHead>
      <title>{title}</title>
      <meta name="description" content={description}/>
      {/* X */}
      <meta name="twitter:card" content={largeCard ? 'summary_large_image' : 'summary'}/>
      {/* https://x.com/MUI_hq */}
      <meta name="twitter:site" content="@MUI_hq"/>
      {/* #major-version-switch */}
      <meta name="twitter:title" content={title}/>
      <meta name="twitter:description" content={description}/>
      <meta name="twitter:image" content={preview}/>
      {/* Facebook */}
      <meta property="og:type" content={type}/>
      <meta property="og:title" content={title}/>
      {/* #major-version-switch */}
      <meta property="og:url" content={`${HOST}${router.asPath}`}/>
      <meta property="og:description" content={description}/>
      <meta property="og:image" content={preview}/>
      <meta property="og:ttl" content="604800"/>
      {/* Algolia */}
      <meta name="docsearch:language" content={userLanguage}/>
      {/* #major-version-switch */}
      <meta name="docsearch:version" content="master"/>
      <style>{logoCss}</style>
      {disableAlternateLocale ? null : languages.map((userLanguage2) => (<link
          key={userLanguage2}
          rel="alternate"
          href={`https://mui.com${userLanguage2 === 'en' ? '' : `/${userLanguage2}`}${canonicalAs}`}
          hrefLang={userLanguage2}
        />))}
      {children}
    </NextHead>);
}
