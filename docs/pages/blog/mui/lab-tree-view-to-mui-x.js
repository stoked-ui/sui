import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './lab-tree-view-to-mui-x.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
