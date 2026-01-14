import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/editor/docs/drop-add/drop-add.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
