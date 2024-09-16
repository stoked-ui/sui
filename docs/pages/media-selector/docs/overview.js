import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from 'docs/data/media-selector/overview.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
