import * as React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Head from 'docs/src/modules/components/Head';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import AppHeader from 'docs/src/layouts/AppHeader';
import AppContainer from 'docs/src/modules/components/AppContainer';
import AppFooter from 'docs/src/layouts/AppFooter';
import HeroEnd from 'docs/src/components/home/HeroEnd';
import ROUTES from 'docs/src/route';
import { Link } from '@stoked-ui/docs';
import { authors } from 'docs/src/modules/components/TopLayoutBlog';

const BLOG_API_URL = (process.env.BLOG_API_URL || process.env.NEXT_PUBLIC_BLOG_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// Replicate the value used by https://medium.com/, a trusted reference.
const BLOG_MAX_WIDTH = 692;

const classes = {
  back: 'TopLayoutBlog-back',
  time: 'TopLayoutBlog-time',
  container: 'TopLayoutBlog-container',
};

const AuthorsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap' as const,
  marginBottom: theme.spacing(2),
  '& .author': {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(3),
    '& .MuiAvatar-root': {
      marginRight: theme.spacing(1),
    },
  },
}));

const Root = styled('div')(
  ({ theme }) => ({
    flexGrow: 1,
    background: `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, #FFFFFF 100%)`,
    backgroundSize: '100% 500px',
    backgroundRepeat: 'no-repeat',
    [`& .${classes.back}`]: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(-1),
    },
    [`& .${classes.container}`]: {
      paddingTop: 60 + 20,
      marginBottom: theme.spacing(12),
      maxWidth: `calc(${BLOG_MAX_WIDTH}px + ${theme.spacing(2 * 2)})`,
      [theme.breakpoints.up('md')]: {
        maxWidth: `calc(${BLOG_MAX_WIDTH}px + ${theme.spacing(3 * 2)})`,
      },
      [theme.breakpoints.up('lg')]: {
        maxWidth: `calc(${BLOG_MAX_WIDTH}px + ${theme.spacing(8 * 2)})`,
      },
      '& h1': {
        marginBottom: theme.spacing(3),
      },
    },
    '& .markdown-body': {
      lineHeight: 1.7,
      '& pre': {
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        background: theme.palette.grey[50],
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        overflowX: 'auto' as const,
      },
      '& img, & video': {
        border: '1px solid',
        borderColor: theme.palette.grey[200],
        borderRadius: 12,
        display: 'block',
        margin: 'auto',
        marginBottom: 16,
      },
      '& strong': {
        color: theme.palette.grey[900],
      },
    },
    [`& .${classes.time}`]: {
      color: theme.palette.text.secondary,
      ...theme.typography.caption,
      fontWeight: 500,
    },
  }),
);

interface ApiPost {
  slug: string;
  title: string;
  description?: string;
  body?: string;
  tags?: string[];
  authors?: string[];
  date?: string;
  status?: string;
  image?: string;
}

interface BlogPostPageProps {
  post: ApiPost;
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const res = await fetch(`${BLOG_API_URL}/blog/public?site=stoked-ui.com`);
    if (res.ok) {
      const json = await res.json();
      const posts: ApiPost[] = json.data || [];
      return {
        paths: posts.map((post) => ({ params: { slug: post.slug } })),
        fallback: 'blocking',
      };
    }
  } catch (e) {
    // API unreachable at build time
    console.warn('Blog API unreachable during getStaticPaths, returning empty paths');
  }
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  try {
    const res = await fetch(`${BLOG_API_URL}/blog/${slug}`);
    if (!res.ok) {
      return { notFound: true };
    }
    const post: ApiPost = await res.json();
    // If the post is a draft, treat as not found (no auth context in SSG)
    if (post.status === 'draft') {
      return { notFound: true };
    }
    return {
      props: { post },
    };
  } catch (e) {
    return { notFound: true };
  }
};

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const postAuthors = post.authors || [];
  const finalTitle = post.title || '';
  const description = post.description || '';

  const authorNames = postAuthors
    .map((key) => {
      const author = authors[key as keyof typeof authors];
      return author ? author.name : key;
    })
    .join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    publisher: {
      '@type': 'Organization',
      name: 'SUI blog',
      url: 'https://stokedconsulting.com/blog/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stokedconsulting.com/static/icons/512x512.png',
      },
    },
    headline: finalTitle,
    url: `https://stoked-ui.com/blog/${post.slug}/`,
    datePublished: post.date,
    dateModified: post.date,
    keywords: (post.tags || []).join(', '),
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://stokedconsulting.com/blog/',
    },
  } as Record<string, unknown>;

  if (postAuthors.length > 0) {
    const firstAuthorKey = postAuthors[0];
    const firstAuthor = authors[firstAuthorKey as keyof typeof authors];
    if (firstAuthor) {
      jsonLd.author = {
        '@type': 'Person',
        name: firstAuthor.name,
        image: {
          '@type': 'ImageObject',
          url: `${firstAuthor.avatar}?s=250`,
          width: 250,
          height: 250,
        },
        sameAs: [`https://github.com/${firstAuthor.github}`],
      };
      jsonLd.image = {
        '@type': 'ImageObject',
        url: post.image || `https://stokedconsulting.com/static/social-previews/blog-preview.jpg`,
        width: 1280,
        height: 640,
      };
    }
  }

  return (
    <BrandingCssVarsProvider>
      <Head
        title={`${finalTitle} - SUI`}
        description={description}
        largeCard
        disableAlternateLocale
        card={post.image || '/static/social-previews/blog-preview.jpg'}
        type="article"
      >
        {authorNames && <meta name="author" content={authorNames} />}
        {post.date && <meta property="article:published_time" content={post.date} />}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <AppHeader />
      <Root>
        <AppContainer component="main" className={classes.container}>
          <Link
            href={ROUTES.blog}
            {...(ROUTES.blog.startsWith('http') && { rel: 'nofollow' })}
            color="primary"
            variant="body2"
            className={classes.back}
          >
            <ChevronLeftRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
            {/* eslint-disable-next-line material-ui/no-hardcoded-labels */}
            {'Back to blog'}
          </Link>
          {post.date && (
            <time dateTime={post.date} className={classes.time}>
              {new Intl.DateTimeFormat('en', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }).format(new Date(post.date))}
            </time>
          )}
          <Typography variant="h1" sx={{ mt: 1, mb: 3 }}>
            {finalTitle}
          </Typography>
          {postAuthors.length > 0 && (
            <AuthorsContainer>
              {postAuthors.map((authorKey) => {
                const author = authors[authorKey as keyof typeof authors];
                if (!author) {
                  return (
                    <div key={authorKey} className="author">
                      <Typography variant="body2" fontWeight="500">
                        {authorKey}
                      </Typography>
                    </div>
                  );
                }
                return (
                  <div key={authorKey} className="author">
                    <Avatar
                      sx={{ width: 36, height: 36 }}
                      alt=""
                      src={`${author.avatar}?s=36`}
                      srcSet={`${author.avatar}?s=72 2x, ${author.avatar}?s=108 3x`}
                    />
                    <div>
                      <Typography variant="body2" fontWeight="500">
                        {author.name}
                      </Typography>
                      <Link
                        href={`https://github.com/${author.github}`}
                        target="_blank"
                        rel="noopener"
                        color="primary"
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        @{author.github}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </AuthorsContainer>
          )}
          {(post.tags || []).length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
              {(post.tags || []).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={(theme) => ({
                    height: 22,
                    fontWeight: 'medium',
                    fontSize: theme.typography.pxToRem(13),
                    '& .MuiChip-label': {
                      px: '6px',
                    },
                  })}
                />
              ))}
            </Box>
          )}
          <div className="markdown-body">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{post.body || ''}</pre>
          </div>
        </AppContainer>
        <Divider />
        <HeroEnd />
        <Divider />
        <AppFooter />
      </Root>
    </BrandingCssVarsProvider>
  );
}
