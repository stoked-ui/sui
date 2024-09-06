import * as React from 'react';
import TopLayoutCareers from '@stoked-ui/docs/components/TopLayoutCareers';
import * as pageProps from 'docs/pages/careers/technical-recruiter.md?muiMarkdown';

export default function Page() {
  return <TopLayoutCareers {...pageProps} />;
}
