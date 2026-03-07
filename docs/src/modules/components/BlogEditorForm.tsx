import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LinkIcon from '@mui/icons-material/Link';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

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
  authToken?: string | null;
}

type ImageMode = 'url' | 'upload';

function ImagePreview({ src }: { src: string }) {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 1,
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
      }}
    >
      <Box
        component="img"
        src={src}
        alt="Featured image preview"
        onError={() => setError(true)}
        sx={{
          display: 'block',
          width: '100%',
          maxHeight: 200,
          objectFit: 'cover',
        }}
      />
    </Box>
  );
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

export default function BlogEditorForm({ formData, onChange, isEditing = false, authToken }: BlogEditorFormProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(isEditing);
  const [imageMode, setImageMode] = React.useState<ImageMode>('url');
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setUploadError('Image must be under 40MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch(getApiUrl('/api/upload/blog-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { message?: string }).message || `Upload failed (${res.status})`);
      }

      const { url } = (await res.json()) as { url: string };
      onChange({ ...formData, image: url });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearImage = () => {
    onChange({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      {/* Featured Image */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="medium">
            Featured Image
          </Typography>
          <ToggleButtonGroup
            value={imageMode}
            exclusive
            onChange={(_, val) => { if (val) setImageMode(val); }}
            size="small"
          >
            <ToggleButton value="url" sx={{ px: 1.5, py: 0.25, textTransform: 'none', fontSize: '0.75rem' }}>
              <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} />
              URL
            </ToggleButton>
            <ToggleButton value="upload" sx={{ px: 1.5, py: 0.25, textTransform: 'none', fontSize: '0.75rem' }}>
              <UploadFileIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Upload
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {imageMode === 'url' ? (
          <TextField
            label="Image URL"
            value={formData.image}
            onChange={(e) => onChange({ ...formData, image: e.target.value })}
            fullWidth
            size="small"
            placeholder="https://example.com/image.jpg"
            helperText="Paste a URL for the post's featured image"
          />
        ) : (
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{ textTransform: 'none' }}
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
              {formData.image && (
                <IconButton size="small" onClick={handleClearImage} title="Remove image">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            {uploadError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {uploadError}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              JPG, PNG, WebP, GIF, or SVG. Max 40MB.
            </Typography>
          </Box>
        )}

        <ImagePreview src={formData.image} />
      </Box>

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
