import React from 'react';
import {
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import type { AgentProfile } from '../../../types';

export interface ManageTabProps {
  profile?: AgentProfile | null;
  selectedFile: string;
  onSelectFile: (fileName: string) => void;
  fileContent: string;
  onFileContentChange: (v: string) => void;
  onSave?: () => void;
  savePending?: boolean;
  saveSuccess?: boolean;
  fileOptions?: { value: string; label: string }[];
  className?: string;
}

const ManageTab: React.FC<ManageTabProps> = ({
  profile,
  selectedFile,
  onSelectFile,
  fileContent,
  onFileContentChange,
  onSave,
  savePending,
  saveSuccess,
  fileOptions,
  className,
}) => {
  const defaultOptions = [
    { value: 'SOUL.md', label: 'SOUL.md (Monologue & Principles)' },
    { value: 'IDENTITY.md', label: 'IDENTITY.md (Ethos & Profile)' },
    { value: 'AGENTS.md', label: 'AGENTS.md (Operating Patterns)' },
    { value: 'USER.md', label: 'USER.md (Operator Context)' },
    { value: 'HEARTBEAT.md', label: 'HEARTBEAT.md (Cron Priorities)' },
    { value: 'MEMORY.md', label: 'MEMORY.md (Long-term Lessons)' },
    { value: 'TASKS.md', label: 'TASKS.md (Active Board)' },
    { value: 'TOOLS.md', label: 'TOOLS.md (Preferences & Aliases)' },
  ];

  const options = fileOptions ||
    (profile?.files
      ? profile.files.map((f) => ({ value: f.fileName, label: f.fileName }))
      : defaultOptions);

  return (
    <Stack
      className={className}
      data-testid="manage-tab"
      spacing={3}
      sx={{
        p: 3,
        bgcolor: '#0b0c10',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
      }}
    >
      <FormControl size="small">
        <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Core Control File
        </InputLabel>
        <Select
          value={selectedFile}
          onChange={(e) => onSelectFile(e.target.value)}
          label="Core Control File"
          data-testid="manage-file-select"
          sx={{
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255, 255, 255, 0.9)',
            '& .MuiSelect-icon': {
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave?.();
        }}
        sx={{
          p: 3,
          bgcolor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 2,
        }}
      >
        <TextField
          multiline
          value={fileContent}
          onChange={(e) => onFileContentChange(e.target.value)}
          minRows={10}
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
          data-testid="manage-file-content"
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
          <Box>
            {saveSuccess ? (
              <Typography sx={{ color: '#2ecc71' }}>
                ✓ File successfully saved.
              </Typography>
            ) : (
              <Typography fontFamily="monospace" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Compiles configuration directly inside the agent workspace.
              </Typography>
            )}
          </Box>
          <Button
            type="submit"
            disabled={savePending}
            variant="contained"
            data-testid="manage-save"
            onClick={onSave}
          >
            {savePending ? 'Compiling...' : `Save ${selectedFile}`}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ManageTab;