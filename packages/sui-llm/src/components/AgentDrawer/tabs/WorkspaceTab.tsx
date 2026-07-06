import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import type { WorkspaceFile } from '../../../types';

export interface WorkspaceTabProps {
  files: WorkspaceFile[];
  loading?: boolean;
  selectedFile?: WorkspaceFile | null;
  selectedFileContent?: string | null;
  onSelectFile?: (file: WorkspaceFile) => void;
  onBack?: () => void;
  agentPath?: string;
  className?: string;
}

const WorkspaceTab: React.FC<WorkspaceTabProps> = ({
  files,
  loading,
  selectedFile,
  selectedFileContent,
  onSelectFile,
  onBack,
  agentPath,
  className,
}) => {
  if (loading) {
    return (
      <Box
        className={className}
        data-testid="workspace-tab"
        sx={{
          p: 4,
          bgcolor: '#0b0c10',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (selectedFile) {
    return (
      <Paper
        className={className}
        data-testid="workspace-tab"
        sx={{
          p: 3,
          bgcolor: '#0b0c10',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          {onBack && (
            <Button
              onClick={onBack}
              data-testid="workspace-back"
              variant="outlined"
              size="small"
            >
              ← Back
            </Button>
          )}
          <Typography
            fontFamily="monospace"
            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            {selectedFile.name} ({selectedFile.size} B)
          </Typography>
        </Stack>

        <TextField
          multiline
          rows={15}
          value={selectedFileContent || '// Loading...'}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            '& .MuiInputBase-root': {
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          data-testid="workspace-file-content"
        />
      </Paper>
    );
  }

  return (
    <Box
      className={className}
      data-testid="workspace-tab"
      sx={{
        p: 3,
        bgcolor: '#0b0c10',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography fontFamily="monospace" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          PATH: {agentPath || '/opt/agents/workspace'}
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {files.length} files
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {files.map((file) => {
          const Icon = file.isDirectory
            ? FolderIcon
            : file.name.endsWith('.log')
            ? DescriptionIcon
            : ArticleIcon;
          return (
            <Paper
              key={file.name}
              data-testid={`workspace-file-${file.name}`}
              onClick={() => !file.isDirectory && onSelectFile?.(file)}
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 2,
                cursor: file.isDirectory ? 'default' : 'pointer',
                '&:hover': file.isDirectory ? {} : { bgcolor: 'rgba(255,255,255,0.04)' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Icon sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 24 }} />
                <Stack sx={{ flexGrow: 1 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {file.name}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {file.isDirectory ? 'Directory' : `${file.size} Bytes`}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {file.mtime}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default WorkspaceTab;