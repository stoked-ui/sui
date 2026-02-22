import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/github/docs/github-events/github-events.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
