import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './introducing-base-ui.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
