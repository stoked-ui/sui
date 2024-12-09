import * as React from 'react';
import MarkdownDocs from '../../../src/modules/components/MarkdownDocs';
import * as pageProps from '../../../data/common/namedId/namedId.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
