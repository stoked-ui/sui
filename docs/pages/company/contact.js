import * as React from 'react';
import TopLayoutCareers from '@stoked-ui/docs/components/TopLayoutCareers';
import * as pageProps from 'docs/src/pages/company/contact/contact.md?muiMarkdown';

export default function Page() {
  return <TopLayoutCareers {...pageProps} />;
}
