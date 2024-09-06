import * as React from 'react';
import ApiPage from '@stoked-ui/docs/ApiPage/ApiPage';
import mapApiPageTranslations from '@stoked-ui/docs/utils/mapApiPageTranslations';
import jsonPageContent from './file-explorer.json';

export default function Page(props) {
  const { descriptions, pageContent } = props;
  return <ApiPage descriptions={descriptions} pageContent={pageContent} />;
}

Page.getInitialProps = () => {
  const req = require.context(
    'docs/translations/api-docs/file-explorer/file-explorer',
    false,
    /\.\/file-explorer.*.json$/,
  );
  const descriptions = mapApiPageTranslations(req);

  return {
    descriptions,
    pageContent: jsonPageContent,
  };
};
