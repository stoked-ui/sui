import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './first-look-at-joy.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
