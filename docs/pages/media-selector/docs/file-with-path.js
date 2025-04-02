import * as React from 'react';
import MarkdownDocs from '../../../src/modules/components/MarkdownDocs';
import * as pageProps from '../../../data/media-selector/file-with-path.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}

