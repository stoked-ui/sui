import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

interface DeliverableFormProps {
  initialValues?: {
    title?: string;
    type?: 'download' | 'link' | 'ux';
    url?: string;
    version?: string;
  };
  onSubmit: (values: { title: string; type: string; url: string; version?: string }) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function DeliverableForm({ initialValues, onSubmit, onCancel, submitLabel = 'Add' }: DeliverableFormProps) {
  const [title, setTitle] = React.useState(initialValues?.title || '');
  const [type, setType] = React.useState(initialValues?.type || 'link');
  const [url, setUrl] = React.useState(initialValues?.url || '');
  const [version, setVersion] = React.useState(initialValues?.version || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, type, url, version: type === 'download' ? version : undefined });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Title"
          fullWidth
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Type"
          select
          fullWidth
          size="small"
          value={type}
          onChange={(e) => setType(e.target.value as 'download' | 'link' | 'ux')}
        >
          <MenuItem value="link">Link</MenuItem>
          <MenuItem value="download">Download</MenuItem>
          <MenuItem value="ux">UX</MenuItem>
        </TextField>
        <TextField
          label="URL"
          fullWidth
          size="small"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        {type === 'download' && (
          <TextField
            label="Version"
            fullWidth
            size="small"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g. 1.0"
          />
        )}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!title || !url}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
