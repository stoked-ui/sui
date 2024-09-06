import * as React from 'react';
import MarkdownDocs from '@stoked-ui/docs/Markdown/MarkdownDocs';
import * as pageProps from '../../../data/media-selector/file-with-path.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
