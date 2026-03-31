import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { styled } from '@mui/material/styles';
// import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import { GithubFileHighlight } from '../../../types/github';

// const StyledTreeItem = styled(TreeItem)((props) => ({
//   '& .MuiTreeItem-content': {
//     padding: props.theme.spacing(1),
//     borderRadius: props.theme.shape.borderRadius,
//     '&:hover': {
//       backgroundColor: props.theme.palette.action.hover,
//     },
//     '& .MuiTreeItem-label': {
//       display: 'flex',
//       alignItems: 'center',
//       gap: props.theme.spacing(1),
//     },
//   },
// }));

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
  highlights?: GithubFileHighlight[];
}

interface HighlightGroup {
  files: FileChange[];
  comment?: string;
}

// interface TreeNode {
//   id: string;
//   name: string;
//   type: FileChange['type'];
//   additions: number;
//   deletions: number;
//   diff: FileChange['diff'];
//   children?: TreeNode[];
// }

function isGroupHighlight(highlight: GithubFileHighlight): highlight is Extract<GithubFileHighlight, { files: string[] }> {
  return 'files' in highlight;
}

function normalizeHighlights(files: FileChange[], highlights: GithubFileHighlight[] = []) {
  const fileMap = new Map(files.map((file) => [file.path, file]));
  const claimedPaths = new Set<string>();
  const groups: HighlightGroup[] = [];

  highlights.forEach((highlight) => {
    const paths = isGroupHighlight(highlight) ? highlight.files : [highlight.file];
    const matchedFiles = paths
      .map((path) => fileMap.get(path))
      .filter((file): file is FileChange => Boolean(file))
      .filter((file) => {
        if (claimedPaths.has(file.path)) {
          return false;
        }

        claimedPaths.add(file.path);
        return true;
      });

    if (matchedFiles.length > 0) {
      groups.push({
        files: matchedFiles,
        comment: highlight.comment,
      });
    }
  });

  return {
    highlightedGroups: groups,
    remainingFiles: files.filter((file) => !claimedPaths.has(file.path)),
  };
}

function renderFileLabel(file: FileChange) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">{file.path}</Typography>
      <Typography variant="caption" color="text.secondary">
        +{file.additions} -{file.deletions}
      </Typography>
    </Box>
  );
}

function renderFileNode({
  file,
  index,
  getFileIcon,
}: {
  file: FileChange;
  index: number;
  getFileIcon: (type: FileChange['type']) => React.ReactNode;
}) {
  const itemId = `file-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <TreeItem
      key={itemId}
      itemId={itemId}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getFileIcon(file.type)}
          {renderFileLabel(file)}
        </Box>
      }
    >
      <Box sx={{ p: '16px' }}>
        <DiffView>
          {file.diff.map((line, diffIndex) => (
            <DiffLine key={`${itemId}-line-${diffIndex}`} type={line.type}>
              {line.content}
            </DiffLine>
          ))}
        </DiffView>
      </Box>
    </TreeItem>
  );
}

export default function FileChanges({ files, highlights }: FileChangesProps): React.JSX.Element {
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

  const { highlightedGroups, remainingFiles } = React.useMemo(
    () => normalizeHighlights(files, highlights),
    [files, highlights],
  );

  // Transform files into tree nodes
  // const items: TreeNode[] = files.map((file, index) => ({
  //   id: `file-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`,
  //   name: file.path,
  //   type: file.type,
  //   additions: file.additions,
  //   deletions: file.deletions,
  //   diff: file.diff
  // }));

  // const renderLabel = (node: TreeNode) => (
  //   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //     {getFileIcon(node.type)}
  //     <Typography variant="body2">{node.name}</Typography>
  //     <Typography variant="caption" color="text.secondary">
  //       +{node.additions} -{node.deletions}
  //     </Typography>
  //   </Box>
  // );

  // const renderContent = (node: TreeNode) => (
  //   <Box sx={{ p: '16px' }}>
  //     <DiffView>
  //       {node.diff.map((line, index) => (
  //         <DiffLine key={`${node.id}-line-${index}`} type={line.type}>
  //           {line.content}
  //         </DiffLine>
  //       ))}
  //     </DiffView>
  //   </Box>
  // );

  return (
    <Box>
      {highlightedGroups.length > 0 ? (
        <Box sx={{ mb: 3, p: 2, border: (theme) => `1px solid ${theme.palette.warning.main}`, borderRadius: 2, backgroundColor: 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip label="Highlighted files" size="small" color="warning" />
            <Typography variant="caption" color="text.secondary">
              Pulled out for focused review
            </Typography>
          </Box>
          {highlightedGroups.map((group, groupIndex) => (
            <Box
              key={`highlight-group-${groupIndex}`}
              sx={{
                mb: groupIndex === highlightedGroups.length - 1 ? 0 : 2,
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              {group.comment ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {group.comment}
                </Typography>
              ) : null}
              <SimpleTreeView
                slots={{
                  collapseIcon: ExpandMoreIcon,
                  expandIcon: ChevronRightIcon,
                }}
                defaultExpandedItems={group.files.map((file, index) => `highlight-${groupIndex}-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`)}
              >
                {group.files.map((file, index) => (
                  <TreeItem
                    key={`highlight-${groupIndex}-${index}-${file.path}`}
                    itemId={`highlight-${groupIndex}-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFileIcon(file.type)}
                        {renderFileLabel(file)}
                      </Box>
                    }
                  >
                    <Box sx={{ p: '16px' }}>
                      <DiffView>
                        {file.diff.map((line, diffIndex) => (
                          <DiffLine key={`highlight-${groupIndex}-${index}-line-${diffIndex}`} type={line.type}>
                            {line.content}
                          </DiffLine>
                        ))}
                      </DiffView>
                    </Box>
                  </TreeItem>
                ))}
              </SimpleTreeView>
            </Box>
          ))}
        </Box>
      ) : null}

      <SimpleTreeView
        slots={{
          collapseIcon: ExpandMoreIcon,
          expandIcon: ChevronRightIcon,
        }}
        expandedItems={expanded}
        selectedItems={selected}
        onExpandedItemsChange={handleToggle}
        onSelectedItemsChange={handleSelect}
        multiSelect
      >
        {remainingFiles.map((file, index) => renderFileNode({ file, index, getFileIcon }))}
      </SimpleTreeView>
    </Box>
  );
} 
