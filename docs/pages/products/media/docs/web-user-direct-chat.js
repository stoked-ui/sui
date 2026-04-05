import * as React from 'react';
import MarkdownDocs from 'docs/src/modules/components/MarkdownDocs';
import * as pageProps from 'docs/data/media/docs/web-user-direct-chat/web-user-direct-chat.md?muiMarkdown';

export default function Page() {
  return <MarkdownDocs {...pageProps} />;
}
