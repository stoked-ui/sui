import * as React from 'react';
import MarkdownDocs from '../../../../src/modules/components/MarkdownDocs';
import * as pageProps from '../../../../data/file-explorer/docs/file-explorer/focus/focus.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
