import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from '../../../data/stoked-ui/faq/faq.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
