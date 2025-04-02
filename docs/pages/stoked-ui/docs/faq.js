import * as React from 'react';
import MarkdownDocs from '../../../src/modules/components/MarkdownDocs';
import * as pageProps from '../../../data/stoked-ui/faq/faq.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}

