import * as React from 'react';
import Fade from '@mui/material/Fade';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import PlayCircleOutlineRounded from '@mui/icons-material/PlayCircleOutlineRounded';
import type { SxProps } from '@mui/system';
import { FileExplorer, File, type FileBase } from '@stoked-ui/file-explorer';
import { getDynamicFiles } from '../fileExplorer/data';

type PreviewEntry = {
  description: string;
  lines?: string[];
  imageSrc?: string;
  label?: string;
  title?: string;
};

type PreviewLookupEntry = {
  item: FileBase;
  path: string[];
};

const INITIAL_SELECTED_ID = '1.1.1';

const PREVIEW_COPY: Record<string, PreviewEntry> = {
  '1': {
    title: 'Documents workspace',
    description: 'Shared project material for active consulting engagements.',
  },
  '1.1': {
    title: 'Company',
    description: 'Client-facing deliverables, internal notes, and review assets.',
  },
  '1.1.1': {
    title: 'Invoice',
    label: 'Invoice #2026-014',
    description: 'Architecture planning, frontend implementation, cloud deployment, and launch support for the current engagement.',
    lines: [
      'Discovery and technical roadmap',
      'React dashboard implementation',
      'CI/CD hardening and AWS rollout',
    ],
  },
  '1.1.2': {
    title: 'Meeting notes',
    label: 'Discovery notes',
    description: 'A concise session summary capturing decisions, blockers, and next actions.',
    lines: [
      'Finalize API contract for the billing endpoints',
      'Ship dashboard filters before stakeholder review',
      'Prepare migration checklist for the legacy admin panel',
    ],
  },
  '1.1.3': {
    title: 'Tasks list',
    label: 'Sprint backlog',
    description: 'A prioritized backlog for the next delivery cycle.',
    lines: [
      'Implement audit logging for admin actions',
      'Add responsive QA pass for tablet breakpoints',
      'Run smoke tests against staging before release',
    ],
  },
  '1.1.4': {
    title: 'Equipment',
    label: 'Equipment checklist',
    description: 'Reference sheet for the deployment and capture workstation setup.',
    lines: [
      'MacBook Pro, 32 GB RAM, dual external displays',
      'Sony A7S III and USB capture bridge',
      '4 TB SSD archive and encrypted backup drive',
    ],
  },
  '1.1.5': {
    title: 'Video conference',
    label: 'Weekly review',
    description: 'Recorded walkthrough of sprint status, blockers, and next milestones.',
  },
  '1.2': {
    title: 'Personal',
    description: 'Private working notes and references that are kept separate from client deliverables.',
  },
  '1.3': {
    title: 'Group photo',
    label: 'Team offsite',
    description: 'A reference image used in the consulting portfolio and case studies.',
    imageSrc: '/static/branding/about/group-photo/group-photo.jpg',
  },
  '2': {
    title: 'Bookmarked',
    description: 'Pinned references, research material, and reusable templates.',
  },
  '2.1': {
    title: 'Learning materials',
    description: 'Saved articles and reference examples for ongoing skill development.',
  },
  '2.2': {
    title: 'News',
    description: 'Industry updates and product launch coverage that inform delivery strategy.',
  },
  '2.3': {
    title: 'Forums',
    description: 'Trusted community threads for fast issue triage and implementation details.',
  },
  '2.4': {
    title: 'Travel documents',
    description: 'PDF packet with itineraries, confirmations, and venue details for upcoming workshops.',
  },
  '3': {
    title: 'History',
    description: 'Archived references from completed projects and earlier iterations.',
  },
};

function buildLookup(items: readonly FileBase[], path: string[] = [], map = new Map<string, PreviewLookupEntry>()) {
  items.forEach((item) => {
    const nextPath = [...path, item.name];
    map.set(item.id, {
      item,
      path: nextPath,
    });
    if (item.children?.length) {
      buildLookup(item.children, nextPath, map);
    }
  });
  return map;
}

function getSelectedId(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[value.length - 1] ?? null;
  }
  return value ?? null;
}

function formatBytes(size?: number) {
  if (!size) {
    return 'Folder';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let current = size;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  const fixed = current >= 10 || unitIndex === 0 ? 0 : 1;
  return `${current.toFixed(fixed)} ${units[unitIndex]}`;
}

function formatDate(lastModified?: number) {
  if (!lastModified) {
    return 'Recently updated';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(lastModified));
}

function getKindLabel(item: FileBase) {
  if (item.mediaType === 'folder') {
    return 'Folder';
  }
  if (item.mediaType === 'pdf') {
    return 'PDF';
  }
  if (item.mediaType === 'doc') {
    return 'DOC';
  }
  if (item.mediaType === 'image') {
    return 'Image';
  }
  if (item.mediaType === 'video') {
    return 'Video';
  }
  return item.mediaType || 'File';
}

function getPreviewIcon(item: FileBase) {
  if (item.mediaType === 'pdf') {
    return <PictureAsPdfRounded fontSize="small" />;
  }
  if (item.mediaType === 'doc') {
    return <DescriptionRounded fontSize="small" />;
  }
  if (item.mediaType === 'image') {
    return <ImageRounded fontSize="small" />;
  }
  if (item.mediaType === 'video') {
    return <PlayCircleOutlineRounded fontSize="small" />;
  }
  return <FolderRounded fontSize="small" />;
}

function FolderPreview({ item }: { item: FileBase }) {
  const childNames = item.children?.slice(0, 4).map((child) => child.name) || [];

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
              color: 'primary.main',
              width: 52,
              height: 52,
            }}
          >
            <FolderRounded />
          </Avatar>
          <div>
            <Typography variant="h6" color="text.primary">
              Folder overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.children?.length || 0} items inside this workspace.
            </Typography>
          </div>
        </Stack>
      </Box>
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Visible contents
        </Typography>
        <Stack spacing={1.25}>
          {childNames.length ? childNames.map((name) => (
            <Box
              key={name}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
              }}
            >
              <Typography variant="body2" color="text.primary">
                {name}
              </Typography>
            </Box>
          )) : (
            <Typography variant="body2" color="text.secondary">
              This folder is empty.
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

function PdfPreview({ item, preview }: { item: FileBase; preview: PreviewEntry }) {
  const invoiceMode = item.id === '1.1.1';

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <div>
          <Typography variant="overline" color="primary.main">
            {preview.label || 'Document'}
          </Typography>
          <Typography variant="h6" color="text.primary">
            {preview.title || item.name}
          </Typography>
        </div>
        <Chip size="small" label={invoiceMode ? 'Open balance' : 'Reference PDF'} color="primary" />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {preview.description}
      </Typography>
      {invoiceMode ? (
        <Stack spacing={1.25}>
          {(preview.lines || []).map((line, index) => (
            <Stack key={line} direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.primary">
                {line}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${[2400, 5200, 1800][index]}
              </Typography>
            </Stack>
          ))}
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" color="text.primary">
              Total due
            </Typography>
            <Typography variant="subtitle2" color="text.primary">
              $9,400
            </Typography>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={1}>
          {(preview.lines || []).map((line) => (
            <Box
              key={line}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
              }}
            >
              <Typography variant="body2" color="text.primary">
                {line}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function DocPreview({ item, preview }: { item: FileBase; preview: PreviewEntry }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 3,
      }}
    >
      <Typography variant="overline" color="primary.main">
        {preview.label || 'Document preview'}
      </Typography>
      <Typography variant="h6" color="text.primary" gutterBottom>
        {preview.title || item.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {preview.description}
      </Typography>
      <Stack spacing={1.25}>
        {(preview.lines || []).map((line) => (
          <Box
            key={line}
            sx={{
              px: 1.5,
              py: 1,
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Typography variant="body2" color="text.primary">
              {line}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function ImagePreview({ item, preview }: { item: FileBase; preview: PreviewEntry }) {
  return (
    <Box
      sx={{
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        component="img"
        src={preview.imageSrc}
        alt={preview.title || item.name}
        sx={{
          display: 'block',
          width: '100%',
          height: 220,
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" color="text.primary" gutterBottom>
          {preview.title || item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {preview.description}
        </Typography>
      </Box>
    </Box>
  );
}

function VideoPreview({ item, preview }: { item: FileBase; preview: PreviewEntry }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.35)}, ${alpha(theme.palette.common.black, 0.2)})`,
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.18),
            color: '#fff',
          }}
        >
          <PlayCircleOutlineRounded sx={{ fontSize: 40 }} />
        </Avatar>
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" color="text.primary" gutterBottom>
          {preview.title || item.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {preview.description}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label="10:00 runtime" />
          <Chip size="small" label="Recorded review" variant="outlined" />
        </Stack>
      </Box>
    </Box>
  );
}

function DocumentPreview({ entry }: { entry: PreviewLookupEntry | undefined }) {
  if (!entry) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2">Select a file to preview it.</Typography>
      </Box>
    );
  }

  const { item, path } = entry;
  const preview = PREVIEW_COPY[item.id] || {
    title: item.name,
    description: 'Preview metadata is available for the selected item.',
  };

  const renderContent = () => {
    if (item.mediaType === 'folder') {
      return <FolderPreview item={item} />;
    }
    if (item.mediaType === 'pdf') {
      return <PdfPreview item={item} preview={preview} />;
    }
    if (item.mediaType === 'doc') {
      return <DocPreview item={item} preview={preview} />;
    }
    if (item.mediaType === 'image') {
      return <ImagePreview item={item} preview={preview} />;
    }
    if (item.mediaType === 'video') {
      return <VideoPreview item={item} preview={preview} />;
    }
    return <DocPreview item={item} preview={preview} />;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
      }}
    >
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
              color: 'primary.main',
            }}
          >
            {getPreviewIcon(item)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" color="text.primary" noWrap>
              {preview.title || item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {path.join(' / ')}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" label={getKindLabel(item)} color="primary" />
          <Chip size="small" label={formatBytes(item.size)} variant="outlined" />
          <Chip size="small" label={formatDate(item.lastModified)} variant="outlined" />
        </Stack>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        {renderContent()}
      </Box>
    </Box>
  );
}

export default function ConsultingDocumentBrowserCard(props: { id?: string; sx?: SxProps }) {
  const items = React.useMemo(() => getDynamicFiles(), []);
  const itemLookup = React.useMemo(() => buildLookup(items), [items]);
  const [selectedId, setSelectedId] = React.useState<string | null>(INITIAL_SELECTED_ID);

  return (
    <Fade in timeout={700}>
      <Card
        data-mui-color-scheme="dark"
        sx={[
          {
            minWidth: 280,
            maxWidth: '100%',
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: (theme) => `0px 4px 8px ${alpha(theme.palette.grey[200], 0.6)}`,
            overflow: 'hidden',
          },
          ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
        ]}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 42%) minmax(0, 1fr)',
            minHeight: 340,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRight: '1px solid',
              borderColor: 'divider',
              minWidth: 0,
            }}
          >
            <Typography variant="overline" color="primary.main">
              Client workspace
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a document to inspect its preview.
            </Typography>
            <FileExplorer
              items={items}
              defaultExpandedItems={['1', '1.1']}
              selectedItems={selectedId || undefined}
              onSelectedItemsChange={(_, ids) => {
                setSelectedId(getSelectedId(ids));
              }}
              sx={{ height: '100%', width: '100%', overflowY: 'auto' }}
              id={props.id || 'consulting-document-browser'}
              alternatingRows
              slots={{ item: File }}
            />
          </Box>
          <Box
            sx={{
              p: 2.5,
              minWidth: 0,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <DocumentPreview entry={selectedId ? itemLookup.get(selectedId) : undefined} />
          </Box>
        </Box>
      </Card>
    </Fade>
  );
}
