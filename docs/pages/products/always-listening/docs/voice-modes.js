import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/always-listening/docs/voice-modes/voice-modes.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
