import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from '../../../data/media-selector/id-generator/id-generator.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
