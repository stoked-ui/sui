import * as React from 'react';
import TopLayoutBlog from '@stoked-ui/docs/components/TopLayoutBlog';
import { docs } from './blog.md?muiMarkdown';
import { LANGUAGES_SSR } from '../../../config';

export default function Page() {
  return <TopLayoutBlog docs={docs} />;
}
