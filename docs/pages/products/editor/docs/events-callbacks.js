import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/editor/docs/events-callbacks/events-callbacks.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
