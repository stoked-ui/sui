import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';

const StyledTreeItem = styled(TreeItem)((props) => ({
  '& .MuiTreeItem-content': {
    padding: props.theme.spacing(1),
    borderRadius: props.theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: props.theme.palette.action.hover,
    },
    '& .MuiTreeItem-label': {
      display: 'flex',
      alignItems: 'center',
      gap: props.theme.spacing(1),
    },
  },
}));

const DiffView = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
  fontSize: '12px',
  lineHeight: 1.5,
  overflow: 'auto',
}));

const DiffLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type?: 'addition' | 'deletion' | 'context' }>(({ theme, type }) => ({
  padding: '0 16px',
  whiteSpace: 'pre',
  ...(type === 'addition' && {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderLeft: '4px solid #2ea043',
  }),
  ...(type === 'deletion' && {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderLeft: '4px solid #f85149',
  }),
  ...(type === 'context' && {
    backgroundColor: 'transparent',
    borderLeft: '4px solid transparent',
  }),
}));

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  diff: Array<{
    type: 'addition' | 'deletion' | 'context';
    content: string;
    lineNumber: number;
  }>;
}

interface FileChangesProps {
  files: FileChange[];
}

interface TreeNode {
  id: string;
  name: string;
  type: FileChange['type'];
  additions: number;
  deletions: number;
  diff: FileChange['diff'];
  children?: TreeNode[];
}

export default function FileChanges({ files }: FileChangesProps): React.JSX.Element {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);

  const handleToggle = (_event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (_event: React.SyntheticEvent, nodeIds: string[]) => {
    setSelected(nodeIds);
  };

  const getFileIcon = (type: FileChange['type']) => {
    switch (type) {
      case 'added':
        return <Chip label="A" size="small" color="success" />;
      case 'modified':
        return <Chip label="M" size="small" color="warning" />;
      case 'deleted':
        return <Chip label="D" size="small" color="error" />;
      default:
        return <FileIcon />;
    }
  };

  // Transform files into tree nodes
  const items: TreeNode[] = files.map((file, index) => ({
    id: `file-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`,
    name: file.path,
    type: file.type,
    additions: file.additions,
    deletions: file.deletions,
    diff: file.diff
  }));

  const renderLabel = (node: TreeNode) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {getFileIcon(node.type)}
      <Typography variant="body2">{node.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        +{node.additions} -{node.deletions}
      </Typography>
    </Box>
  );

  const renderContent = (node: TreeNode) => (
    <Box sx={{ p: '16px' }}>
      <DiffView>
        {node.diff.map((line, index) => (
          <DiffLine key={`${node.id}-line-${index}`} type={line.type}>
            {line.content}
          </DiffLine>
        ))}
      </DiffView>
    </Box>
  );

  return (
    <Box>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {files.map((file, index) => {
          const nodeId = `file-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
          return (
            <TreeItem
              key={nodeId}
              nodeId={nodeId}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getFileIcon(file.type)}
                  <Typography variant="body2">{file.path}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    +{file.additions} -{file.deletions}
                  </Typography>
                </Box>
              }
            >
              <Box sx={{ p: '16px' }}>
                <DiffView>
                  {file.diff.map((line, index) => (
                    <DiffLine key={`${nodeId}-line-${index}`} type={line.type}>
                      {line.content}
                    </DiffLine>
                  ))}
                </DiffView>
              </Box>
            </TreeItem>
          );
        })}
      </TreeView>
    </Box>
  );
} 