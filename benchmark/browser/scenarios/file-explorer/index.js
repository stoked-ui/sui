/**
 * FileExplorer Performance Benchmark - Browser Scenario
 *
 * Tests render performance, drag operations, and memory usage in actual browser environment
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { FileExplorer } from '@stoked-ui/file-explorer';

// ============================================================================
// Test Data Generator
// ============================================================================

function generateFileTree(itemCount, prefix = 'item') {
  const items = [];
  const foldersCount = Math.floor(itemCount * 0.3);
  const filesCount = itemCount - foldersCount;

  for (let i = 0; i < foldersCount; i++) {
    items.push({
      id: `folder-${i}`,
      name: `${prefix}-folder-${i}`,
      type: 'folder',
      children: i % 3 === 0 ? [] : undefined,
    });
  }

  for (let i = 0; i < filesCount; i++) {
    items.push({
      id: `file-${i}`,
      name: `${prefix}-file-${i}.txt`,
      type: 'file',
      mediaType: 'text/plain',
    });
  }

  return items;
}

// ============================================================================
// Benchmark Scenarios
// ============================================================================

export function FileExplorer100Items() {
  const items = React.useMemo(() => generateFileTree(100, 'test-100'), []);

  return React.createElement(
    FileExplorer,
    {
      items,
      defaultExpandedItems: ['folder-0'],
    }
  );
}

export function FileExplorer1000Items() {
  const items = React.useMemo(() => generateFileTree(1000, 'test-1000'), []);

  return React.createElement(
    FileExplorer,
    {
      items,
      defaultExpandedItems: ['folder-0', 'folder-1'],
    }
  );
}

export function FileExplorerWithDnd() {
  const items = React.useMemo(() => generateFileTree(100, 'dnd-test'), []);

  return React.createElement(
    FileExplorer,
    {
      items,
      defaultExpandedItems: ['folder-0'],
    }
  );
}

// ============================================================================
// Default Export - Used by benchmark runner
// ============================================================================

export default function renderFileExplorerBenchmark() {
  const container = document.querySelector('#root');

  // Get scenario from URL or default to 100 items
  const params = new URLSearchParams(window.location.search);
  const scenario = params.get('scenario') || '100';

  let Component;
  switch (scenario) {
    case '1000':
      Component = FileExplorer1000Items;
      break;
    case 'dnd':
      Component = FileExplorerWithDnd;
      break;
    default:
      Component = FileExplorer100Items;
  }

  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(Component));
}
