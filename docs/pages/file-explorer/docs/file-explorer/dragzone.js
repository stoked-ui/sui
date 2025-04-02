import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/file-explorer/docs/file-explorer/dropzone/dropzone.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}

