import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/stokd-cloud/docs/review-commands/review-commands.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
