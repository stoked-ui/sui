import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './toolpad-use-cases.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
