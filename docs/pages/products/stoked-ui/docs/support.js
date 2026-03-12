import * as React from 'react';
import { useTheme } from '@mui/system';
import AppLayoutDocs from '../../../src/modules/components/AppLayoutDocs';
import RichMarkdownElement from '../../../src/modules/components/RichMarkdownElement';
import { useUserLanguage } from '@stoked-ui/docs/i18n';
import * as pageProps from '../../../data/stoked-ui/support/support.md?muiMarkdown';

export default function Page() {
  const theme = useTheme();
  const userLanguage = useUserLanguage();
  const localizedDoc = pageProps.docs[userLanguage] || pageProps.docs.en;

  return (
    <AppLayoutDocs
      cardOptions={{
        description: localizedDoc.headers.cardDescription,
        title: localizedDoc.headers.cardTitle,
      }}
      description={localizedDoc.description}
      disableAd
      location={localizedDoc.location}
      title={localizedDoc.title}
      toc={localizedDoc.toc}
    >
      {localizedDoc.rendered.map((renderedMarkdownOrDemo, index) => (
        <RichMarkdownElement
          key={`demos-section-${index}`}
          demoComponents={pageProps.demoComponents}
          demos={pageProps.demos || {}}
          disableAd
          localizedDoc={localizedDoc}
          renderedMarkdownOrDemo={renderedMarkdownOrDemo}
          srcComponents={pageProps.srcComponents}
          theme={theme}
          WrapperComponent={React.Fragment}
          wrapperProps={{}}
        />
      ))}
    </AppLayoutDocs>
  );
}
