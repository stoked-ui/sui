import * as React from 'react';
import ApiPage from '@stoked-ui/docs/ApiPage/ApiPage';
import mapApiPageTranslations from '@stoked-ui/docs/utils/mapApiPageTranslations';
import jsonPageContent from './file-explorer-basic.json';

export default function Page(props) {
  const { descriptions, pageContent } = props;
  return <ApiPage descriptions={descriptions} pageContent={pageContent} />;
}

Page.getInitialProps = () => {
  const req = require.context(
    'docs/translations/api-docs/file-explorer/file-explorer-basic',
    false,
    /\.\/file-explorer-basic.*.json$/,
  );
  const descriptions = mapApiPageTranslations(req);

  return {
    descriptions,
    pageContent: jsonPageContent,
  };
};
