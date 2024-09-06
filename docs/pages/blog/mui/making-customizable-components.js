import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './making-customizable-components.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
