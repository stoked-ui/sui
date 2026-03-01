import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

interface LogoUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function LogoUpload({
  value,
  onChange,
  label = 'Upload Logo',
  disabled = false,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const base64Data = dataUrl.split(',')[1];
        const token = localStorage.getItem('auth_token');

        const response = await fetch('/api/upload/product-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file: base64Data,
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          onChange(data.url);
        } else {
          const data = await response.json().catch(() => ({}));
          setError(data.message || 'Upload failed. Please try again.');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {value && (
          <Avatar
            src={value}
            sx={{ width: 64, height: 64 }}
            variant="rounded"
          />
        )}

        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Button
            variant="outlined"
            onClick={handleButtonClick}
            disabled={disabled}
          >
            {value ? 'Change' : label}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
