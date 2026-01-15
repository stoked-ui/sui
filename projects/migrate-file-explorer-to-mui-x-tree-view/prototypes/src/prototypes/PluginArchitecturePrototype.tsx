import React, { useState } from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { Box, Typography, Paper, Alert, Divider, Chip, Grid } from '@mui/material';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks';

const SAMPLE_ITEMS: TreeViewBaseItem[] = [
  {
    id: '1',
    label: 'src',
    children: [
      { id: '1.1', label: 'components' },
      { id: '1.2', label: 'utils.ts' },
    ],
  },
  {
    id: '2',
    label: 'docs',
    children: [
      { id: '2.1', label: 'readme.md' },
    ],
  },
];

interface PluginCompatibility {
  name: string;
  nativeSupport: boolean;
  adapterRequired: boolean;
  complexity: 'Low' | 'Medium' | 'High';
  notes: string;
}

const PLUGIN_ANALYSIS: PluginCompatibility[] = [
  {
    name: 'useFileExplorerFiles',
    nativeSupport: true,
    adapterRequired: false,
    complexity: 'Low',
    notes: 'Maps to RichTreeView items prop directly',
  },
  {
    name: 'useFileExplorerExpansion',
    nativeSupport: true,
    adapterRequired: false,
    complexity: 'Low',
    notes: 'Native expansion API via setItemExpansion',
  },
  {
    name: 'useFileExplorerSelection',
    nativeSupport: true,
    adapterRequired: false,
    complexity: 'Low',
    notes: 'Native selection with multiSelect support',
  },
  {
    name: 'useFileExplorerFocus',
    nativeSupport: true,
    adapterRequired: false,
    complexity: 'Low',
    notes: 'Native focus management via focusItem',
  },
  {
    name: 'useFileExplorerKeyboardNavigation',
    nativeSupport: true,
    adapterRequired: false,
    complexity: 'Low',
    notes: 'Built-in keyboard navigation',
  },
  {
    name: 'useFileExplorerIcons',
    nativeSupport: true,
    adapterRequired: true,
    complexity: 'Low',
    notes: 'Use slots prop with custom icons',
  },
  {
    name: 'useFileExplorerGrid',
    nativeSupport: false,
    adapterRequired: true,
    complexity: 'High',
    notes: 'Requires custom wrapper component',
  },
  {
    name: 'useFileExplorerDnd',
    nativeSupport: false,
    adapterRequired: true,
    complexity: 'Medium',
    notes: 'Keep @atlaskit/pragmatic-drag-and-drop',
  },
];

export default function PluginArchitecturePrototype() {
  const apiRef = useTreeViewApiRef();
  const [findings, setFindings] = useState<string[]>([]);

  React.useEffect(() => {
    const compatible = PLUGIN_ANALYSIS.filter(p => p.nativeSupport || p.complexity !== 'High').length;
    const total = PLUGIN_ANALYSIS.length;

    const newFindings: string[] = [
      `✓ ${compatible}/${total} plugins compatible with MUI X architecture`,
      `✓ ${PLUGIN_ANALYSIS.filter(p => p.nativeSupport).length} plugins have native equivalents`,
      `⚠ ${PLUGIN_ANALYSIS.filter(p => p.adapterRequired).length} plugins need adapter patterns`,
      `⚠ ${PLUGIN_ANALYSIS.filter(p => p.complexity === 'High').length} plugins require significant refactoring`,
    ];

    setFindings(newFindings);
  }, []);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        AC-1.2.c: Plugin Pattern Compatibility
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Analyzing FileExplorer's 8 plugins against MUI X RichTreeView architecture
      </Alert>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Plugin Compatibility Matrix
        </Typography>

        <Grid container spacing={2}>
          {PLUGIN_ANALYSIS.map((plugin, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {plugin.name}
                  </Typography>
                  <Chip
                    label={plugin.complexity}
                    color={getComplexityColor(plugin.complexity)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={plugin.nativeSupport ? 'Native Support' : 'No Native Support'}
                    color={plugin.nativeSupport ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {plugin.adapterRequired && (
                    <Chip
                      label="Adapter Required"
                      color="warning"
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {plugin.notes}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          MUI X Plugin System Demo
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          MUI X uses a plugin-based architecture internally. Custom plugins can be created using hooks.
        </Typography>

        <RichTreeView
          items={SAMPLE_ITEMS}
          apiRef={apiRef}
          defaultExpandedItems={['1', '2']}
          multiSelect
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          This tree uses native MUI X plugins: expansion, selection, focus, keyboard navigation
        </Typography>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Plugin Migration Analysis
      </Typography>

      <Paper sx={{ p: 2 }}>
        {findings.map((finding, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            {finding}
          </Typography>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Migration Strategy by Plugin:
        </Typography>

        <Typography variant="body2" component="div">
          <strong>Direct Migration (5 plugins):</strong>
          <ul>
            <li>useFileExplorerFiles → items prop + data management</li>
            <li>useFileExplorerExpansion → native expansion API</li>
            <li>useFileExplorerSelection → native selection API</li>
            <li>useFileExplorerFocus → native focus API</li>
            <li>useFileExplorerKeyboardNavigation → built-in support</li>
          </ul>

          <strong>Adapter Pattern (2 plugins):</strong>
          <ul>
            <li>useFileExplorerIcons → create icon mapping layer using slots</li>
            <li>useFileExplorerDnd → maintain @atlaskit integration, add MUI X tree state</li>
          </ul>

          <strong>Custom Implementation (1 plugin):</strong>
          <ul>
            <li>useFileExplorerGrid → build wrapper component with custom rendering</li>
          </ul>
        </Typography>

        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Verdict:</strong> 6/8 plugins can be migrated with low-medium effort.
            Plugin architecture is compatible with adapter pattern approach.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
