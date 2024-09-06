import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './aggregation-functions.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
