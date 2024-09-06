import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './mui-core-v5.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
