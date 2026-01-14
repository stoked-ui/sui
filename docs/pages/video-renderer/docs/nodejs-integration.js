import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/video-renderer/docs/nodejs-integration/nodejs-integration.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
