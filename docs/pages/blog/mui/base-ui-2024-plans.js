import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './base-ui-2024-plans.md?muiMarkdown';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
