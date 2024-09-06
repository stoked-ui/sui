import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from 'docs/data/file-explorer/docs/file-explorer/drag-and-drop/drag-and-drop.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
