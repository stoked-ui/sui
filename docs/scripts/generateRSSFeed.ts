import fs from 'fs';
import { Feed } from 'feed';
import { BlogPost } from 'docs/lib/sourcing';
import ROUTES from 'docs/src/route';

const BLOG_API_URL = process.env.BLOG_API_URL || process.env.NEXT_PUBLIC_BLOG_API_URL || 'http://localhost:3001/v1';

export default async function generateRssFeed(allBlogPosts: Array<BlogPost>) {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const siteUrl = 'https://stoked-ui.com';

  // Fetch additional posts from the Blog API public endpoint.
  // If the API is unreachable at build time, fall back to markdown-only posts.
  let apiPosts: Array<BlogPost> = [];
  try {
    const res = await fetch(`${BLOG_API_URL}/blog/public?site=stoked-ui.com&limit=100`);
    if (res.ok) {
      const json = await res.json();
      apiPosts = (json.data || []).map((post: any) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        image: post.image,
        tags: post.tags || [],
        authors: post.authors,
        date: post.date,
        sui: true,
      }));
    }
  } catch (e) {
    // API unreachable at build time — fall back to markdown-only posts.
    console.warn('[generateRssFeed] Blog API unreachable, RSS feed will include markdown posts only.');
  }

  // Merge API posts with markdown posts.
  // Markdown posts take precedence: deduplicate by slug.
  const markdownSlugs = new Set(allBlogPosts.map((p) => p.slug));
  const newApiPosts = apiPosts.filter((p) => !markdownSlugs.has(p.slug));
  const mergedPosts = [...allBlogPosts, ...newApiPosts].sort((post1, post2) => {
    if (post1.date && post2.date) {
      return new Date(post1.date) > new Date(post2.date) ? -1 : 1;
    }
    if (post1.date && !post2.date) {
      return 1;
    }
    return -1;
  });

  const feed = new Feed({
    title: 'SUI - Blog',
    description:
      'Follow the SUI blog to learn about new product features, latest advancements in UI development, and business initiatives.',
    id: `${siteUrl}/blog`,
    link: `${siteUrl}/blog`,
    language: 'en',
    image: `${siteUrl}/static/logo.svg`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `Copyright © ${new Date().getFullYear()} Stoked Consulting`,
    feedLinks: {
      rss2: `${siteUrl}/public${ROUTES.rssFeed}`,
    },
  });

  mergedPosts.forEach((post) => {
    const postAuthors = post.authors && post.authors.map((author) => ({ name: author }));
    const postDate = post.date ? new Date(post.date) : new Date();
    const postCategory = post.tags.map((tag) => ({ name: tag }));
    const postLink = `${siteUrl}/blog/${post.slug}`;

    feed.addItem({
      title: post.title,
      image: post.image,
      id: postLink,
      link: postLink,
      description: post.description,
      category: postCategory,
      date: postDate,
      author: postAuthors,
    });
  });

  fs.mkdirSync(`public${ROUTES.rssFeed.replace('rss.xml', '')}`, { recursive: true });
  fs.writeFileSync(`public${ROUTES.rssFeed}`, feed.rss2());
}
