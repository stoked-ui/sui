import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './docs-restructure-2022.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
