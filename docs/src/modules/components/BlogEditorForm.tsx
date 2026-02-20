import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

export interface BlogPostFormData {
  title: string;
  description: string;
  slug: string;
  tags: string[];
  authors: string;
  targetSites: string[];
  image: string;
}

interface BlogEditorFormProps {
  formData: BlogPostFormData;
  onChange: (data: BlogPostFormData) => void;
  isEditing?: boolean;
}

// Tag whitelist from docs/lib/sourcing.ts
const ALL_TAGS = [
  'Company',
  'Developer Survey',
  'Guide',
  'Product',
  'Stoked UI',
  'MUI X',
  'Material UI',
  'Base UI',
  'Pigment CSS',
  'Joy UI',
  'SUI X',
  'SUI System',
  'Toolpad',
  'SUI',
  'File Explorer',
  'Media Selector',
  'Video Editor',
  'Timeline',
  'Consulting',
  'Announcement',
  'Tutorial',
  'Release',
  'Personal',
  'Nostr',
  'Editor',
];

const TARGET_SITES = ['stoked-ui.com', 'brianstoker.com'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogEditorForm({ formData, onChange, isEditing = false }: BlogEditorFormProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(isEditing);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const updates: BlogPostFormData = { ...formData, title: newTitle };
    if (!slugManuallyEdited) {
      updates.slug = slugify(newTitle);
    }
    onChange(updates);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    onChange({ ...formData, slug: e.target.value });
  };

  const handleTagToggle = (tag: string) => {
    const tags = formData.tags.includes(tag)
      ? formData.tags.filter((t) => t !== tag)
      : [...formData.tags, tag];
    onChange({ ...formData, tags });
  };

  const handleSiteToggle = (site: string) => {
    const targetSites = formData.targetSites.includes(site)
      ? formData.targetSites.filter((s) => s !== site)
      : [...formData.targetSites, site];
    onChange({ ...formData, targetSites });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <TextField
        label="Title"
        value={formData.title}
        onChange={handleTitleChange}
        required
        fullWidth
        size="small"
        placeholder="Enter post title..."
        inputProps={{ maxLength: 200 }}
        helperText={`${formData.title.length}/200`}
      />

      {/* Slug */}
      <TextField
        label="Slug"
        value={formData.slug}
        onChange={handleSlugChange}
        required
        fullWidth
        size="small"
        placeholder="auto-generated-from-title"
        helperText="Used in the URL: /blog/{slug}"
        InputProps={{
          startAdornment: (
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, whiteSpace: 'nowrap' }}>
              /blog/
            </Typography>
          ),
        }}
      />

      {/* Description */}
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => onChange({ ...formData, description: e.target.value })}
        required
        fullWidth
        multiline
        rows={3}
        size="small"
        placeholder="Brief description of the post..."
        inputProps={{ maxLength: 500 }}
        helperText={`${formData.description.length}/500`}
      />

      {/* Featured Image URL */}
      <TextField
        label="Featured Image URL"
        value={formData.image}
        onChange={(e) => onChange({ ...formData, image: e.target.value })}
        fullWidth
        size="small"
        placeholder="https://example.com/image.jpg"
        helperText="Optional: URL for the post's featured image"
      />

      {/* Authors */}
      <TextField
        label="Authors"
        value={formData.authors}
        onChange={(e) => onChange({ ...formData, authors: e.target.value })}
        fullWidth
        size="small"
        placeholder="authorKey1, authorKey2"
        helperText="Comma-separated author keys (e.g., bstoker)"
      />

      <Divider />

      {/* Tags */}
      <Box>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {ALL_TAGS.map((tag) => {
            const selected = formData.tags.includes(tag);
            return (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant={selected ? 'filled' : 'outlined'}
                color={selected ? 'primary' : undefined}
                onClick={() => handleTagToggle(tag)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.85 },
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Divider />

      {/* Target Sites */}
      <Box>
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
          Target Sites
        </Typography>
        <FormGroup row>
          {TARGET_SITES.map((site) => (
            <FormControlLabel
              key={site}
              control={
                <Checkbox
                  size="small"
                  checked={formData.targetSites.includes(site)}
                  onChange={() => handleSiteToggle(site)}
                />
              }
              label={<Typography variant="body2">{site}</Typography>}
            />
          ))}
        </FormGroup>
      </Box>
    </Box>
  );
}
