import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocsV2';
import AppFrame from 'docs/src/modules/components/AppFrame';
import * as pageProps from 'docs/data/base/components/switch/switch.md?@mui/markdown';
import mapApiPageTranslations from 'docs/src/modules/utils/mapApiPageTranslations';
import SwitchUnstyledApiJsonPageContent from '../../api/switch-unstyled.json';
import useSwitchApiJsonPageContent from '../../api/use-switch.json';

export default function Page(props) {
  const { userLanguage, ...other } = props;
  return <MarkdownDocs {...pageProps} {...other} />;
}

Page.getLayout = (page) => {
  return <AppFrame>{page}</AppFrame>;
};

export const getStaticPaths = () => {
  return {
    paths: [{ params: { docsTab: 'components-api' } }, { params: { docsTab: 'hooks-api' } }],
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps = () => {
  const SwitchUnstyledApiReq = require.context(
    'docs/translations/api-docs/switch-unstyled',
    false,
    /switch-unstyled.*.json$/,
  );
  const SwitchUnstyledApiDescriptions = mapApiPageTranslations(SwitchUnstyledApiReq);

  const useSwitchApiReq = require.context(
    'docs/translations/api-docs/use-switch',
    false,
    /use-switch.*.json$/,
  );
  const useSwitchApiDescriptions = mapApiPageTranslations(useSwitchApiReq);

  return {
    props: {
      componentsApiDescriptions: { SwitchUnstyled: SwitchUnstyledApiDescriptions },
      componentsApiPageContents: { SwitchUnstyled: SwitchUnstyledApiJsonPageContent },
      hooksApiDescriptions: { useSwitch: useSwitchApiDescriptions },
      hooksApiPageContents: { useSwitch: useSwitchApiJsonPageContent },
    },
  };
};
