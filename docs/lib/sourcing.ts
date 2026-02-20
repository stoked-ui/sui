import fs from 'fs';
import path from 'path';
import { getHeaders } from '@stoked-ui/docs-markdown';

const blogMuiDir = path.join(process.cwd(), 'pages/blog/mui');
const blogDir = path.join(process.cwd(), 'pages/blog/sui');


export const getBlogFilePaths = (ext = '.md') => {
  const muiBlogPaths = fs.readdirSync(blogMuiDir).filter((file) => file.endsWith(ext));
  const suiBlogPaths = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((file) => file.endsWith(ext))
    : [];
  // Deduplicate: SUI posts take precedence over MUI posts with the same filename
  const suiSet = new Set(suiBlogPaths);
  const filteredMuiPaths = muiBlogPaths.filter((p) => !suiSet.has(p));
  return filteredMuiPaths.concat(suiBlogPaths);
};

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image?: string;
  tags: Array<string>;
  authors?: Array<string>;
  date?: string;
  sui?: boolean;
}

export function getBlogPost(filePath: string): BlogPost {
  const slug = filePath.replace(/\.md$/, '');

  // Determine which directory the file lives in.
  // SUI directory takes precedence; fall back to MUI directory.
  const suiFilePath = path.join(blogDir, filePath);
  const isSui = fs.existsSync(blogDir) && fs.existsSync(suiFilePath);
  const resolvedDir = isSui ? blogDir : blogMuiDir;

  const content = fs.readFileSync(path.join(resolvedDir, filePath), 'utf-8');

  const headers = getHeaders(content) as unknown as BlogPost;

  return {
    ...headers,
    slug,
    ...(isSui ? { sui: true } : {}),
  };
}

// Avoid typos in the blog markdown pages.
// https://www.notion.so/mui-org/Blog-247ec2bff5fa46e799ef06a693c94917
const ALLOWED_TAGS = [
  'Company',
  'Developer Survey',
  'Guide',
  'Product',
  // Product tags
  'Stoked UI',
  'MUI X',
  'Material UI',
  'Base UI',
  'Pigment CSS',
  'Joy UI',
  'SUI X',
  'SUI System',
  'Toolpad',
];

const SUI_TAGS = [
  'Stoked UI',
  'SUI',
  'File Explorer',
  'Media Selector',
  'Video Editor',
  'Timeline',
];

const BLOG_TAGS = [
  'Consulting',
  'Announcement',
  'Tutorial',
  'Release',
  'Personal',
  'Nostr',
  'Editor',
];

// Union of all tag arrays with no duplicates
const ALL_TAGS = Array.from(new Set([...ALLOWED_TAGS, ...SUI_TAGS, ...BLOG_TAGS]));

export const getAllBlogPosts = () => {
  const filePaths = getBlogFilePaths();
  const rawBlogPosts = filePaths
    .map((name) => getBlogPost(name))
    // sort allBlogPosts by date in descending order
    .sort((post1, post2) => {
      if (post1.date && post2.date) {
        return new Date(post1.date) > new Date(post2.date) ? -1 : 1;
      }
      if (post1.date && !post2.date) {
        return 1;
      }
      return -1;
    });
  const allBlogPosts = rawBlogPosts.filter((post) => !!post.title);
  const tagInfo: Record<string, number | undefined> = {};
  allBlogPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (!ALL_TAGS.includes(tag)) {
        throw new Error(
          `The tag "${tag}" in "${post.title}" was not whitelisted. Are you sure it's not a typo?`,
        );
      }


      tagInfo[tag] = (tagInfo[tag] || 0) + 1;
    });
  });

  return {
    allBlogPosts, // posts with at least a title
    tagInfo,
  };
};
