import * as React from 'react';
import TopLayoutCareers from '@stoked-ui/docs/components/TopLayoutCareers';
import * as pageProps from 'docs/pages/careers/react-engineer-x.md?muiMarkdown';

export default function Page() {
  return <TopLayoutCareers {...pageProps} />;
}
