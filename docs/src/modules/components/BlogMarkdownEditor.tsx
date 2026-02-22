import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface BlogMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const EditorTextarea = styled('textarea')(({ theme }) => [
  {
    width: '100%',
    height: '100%',
    minHeight: 400,
    padding: theme.spacing(2),
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    fontSize: 14,
    lineHeight: 1.6,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    resize: 'vertical',
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.text.primary,
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
    },
  },
  theme.applyDarkStyles({
    backgroundColor: theme.palette.primaryDark[900],
  }),
]);

const PreviewPane = styled(Box)(({ theme }) => [{
  width: '100%',
  height: '100%',
  minHeight: 400,
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  fontFamily: theme.typography.body1.fontFamily,
  fontSize: 14,
  lineHeight: 1.7,
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    lineHeight: 1.3,
  },
  '& h1': { fontSize: '2em' },
  '& h2': { fontSize: '1.5em' },
  '& h3': { fontSize: '1.25em' },
  '& p': {
    marginBottom: theme.spacing(1.5),
  },
  '& code': {
    fontFamily: '"Fira Code", "Consolas", monospace',
    fontSize: '0.875em',
    backgroundColor: theme.palette.grey[100],
    padding: '2px 4px',
    borderRadius: 4,
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: 0,
    paddingLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
  '& hr': {
    border: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: theme.spacing(2, 0),
  },
  '& img': {
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: theme.spacing(2),
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(0.75, 1),
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 600,
  },
},
  theme.applyDarkStyles({
    '& code': {
      backgroundColor: theme.palette.primaryDark[800],
    },
    '& pre': {
      backgroundColor: theme.palette.primaryDark[800],
    },
    '& th': {
      backgroundColor: theme.palette.primaryDark[800],
    },
  }),
]);

/**
 * Minimal markdown-to-HTML converter for preview purposes.
 * Handles common markdown syntax without external dependencies.
 */
function simpleMarkdownToHtml(markdown: string): string {
  if (!markdown) {
    return '';
  }

  let html = markdown;

  // Escape HTML special characters first (except in code blocks)
  // We'll handle code blocks separately
  const codeBlocks: string[] = [];
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeBlocks.length;
    codeBlocks.push(match);
    return `__CODE_BLOCK_${idx}__`;
  });

  const inlineCodes: string[] = [];
  html = html.replace(/`[^`]+`/g, (match) => {
    const idx = inlineCodes.length;
    inlineCodes.push(match);
    return `__INLINE_CODE_${idx}__`;
  });

  // Escape HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore and process code blocks
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => {
    const block = codeBlocks[parseInt(idx, 10)];
    const match = block.match(/^```(\w*)\n?([\s\S]*?)```$/);
    if (match) {
      const lang = match[1] ? ` class="language-${match[1]}"` : '';
      const code = match[2]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre><code${lang}>${code}</code></pre>`;
    }
    return block;
  });

  // Restore inline code
  html = html.replace(/__INLINE_CODE_(\d+)__/g, (_, idx) => {
    const code = inlineCodes[parseInt(idx, 10)];
    const inner = code
      .slice(1, -1)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<code>${inner}</code>`;
  });

  // Headings
  html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered lists
  html = html.replace(/^(\s*[-*+]\s+.+)(\n\s*[-*+]\s+.+)*/gm, (match) => {
    const items = match.split('\n').filter(Boolean).map((line) => {
      const content = line.replace(/^\s*[-*+]\s+/, '');
      return `<li>${content}</li>`;
    });
    return `<ul>${items.join('')}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^(\s*\d+\.\s+.+)(\n\s*\d+\.\s+.+)*/gm, (match) => {
    const items = match.split('\n').filter(Boolean).map((line) => {
      const content = line.replace(/^\s*\d+\.\s+/, '');
      return `<li>${content}</li>`;
    });
    return `<ol>${items.join('')}</ol>`;
  });

  // Paragraphs - wrap lines that aren't already block elements
  const lines = html.split('\n');
  const result: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (
      line === '' ||
      line.startsWith('<h') ||
      line.startsWith('<ul') ||
      line.startsWith('<ol') ||
      line.startsWith('<pre') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<hr') ||
      line.startsWith('<img')
    ) {
      if (line !== '') {
        result.push(line);
      }
    } else {
      result.push(`<p>${line}</p>`);
    }
    i += 1;
  }

  return result.join('\n');
}

export default function BlogMarkdownEditor({ value, onChange }: BlogMarkdownEditorProps) {
  const previewHtml = React.useMemo(() => simpleMarkdownToHtml(value), [value]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ pl: 0.5 }}>
            Markdown Editor
          </Typography>
          <EditorTextarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your blog post in Markdown..."
            spellCheck
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium" sx={{ pl: 0.5 }}>
            Preview
          </Typography>
          <PreviewPane
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color: #999; font-style: italic;">Preview will appear here...</p>' }}
          />
        </Box>
      </Box>
    </Box>
  );
}
