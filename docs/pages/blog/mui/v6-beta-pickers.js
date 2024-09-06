import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './v6-beta-pickers.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
