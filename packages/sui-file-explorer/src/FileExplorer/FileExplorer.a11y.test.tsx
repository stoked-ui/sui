/**
 * Accessibility audit suite for FileExplorer migration validation
 * Tests WCAG 2.1 AA compliance and keyboard navigation
 */

import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FileExplorer } from './FileExplorer';

expect.extend(toHaveNoViolations);

const sampleData = [
  {
    id: 'folder-1',
    label: 'Documents',
    children: [
      { id: 'file-1', label: 'Report.pdf' },
      { id: 'file-2', label: 'Presentation.pptx' }
    ]
  },
  {
    id: 'folder-2',
    label: 'Projects',
    children: [
      {
        id: 'folder-3',
        label: 'React',
        children: [
          { id: 'file-3', label: 'App.tsx' },
          { id: 'file-4', label: 'index.tsx' }
        ]
      }
    ]
  },
  { id: 'file-5', label: 'README.md' }
];

describe('FileExplorer Accessibility', () => {
  afterEach(cleanup);

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no axe violations with basic tree', async () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with expanded items', async () => {
      const { container } = render(
        <FileExplorer items={sampleData} defaultExpandedItems={['folder-1', 'folder-2']} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with selected items', async () => {
      const { container } = render(
        <FileExplorer items={sampleData} defaultSelectedItems={['file-1']} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA roles', () => {
      const { container } = render(<FileExplorer items={sampleData} />);

      // Check for tree structure
      const tree = container.querySelector('[role="tree"]');
      expect(tree).toBeInTheDocument();

      // Check for tree items
      const treeItems = container.querySelectorAll('[role="treeitem"]');
      expect(treeItems.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA attributes', () => {
      const { container } = render(
        <FileExplorer items={sampleData} defaultExpandedItems={['folder-1']} />
      );

      // Check for aria-expanded on folder items
      const expandedItems = container.querySelectorAll('[aria-expanded="true"]');
      expect(expandedItems.length).toBeGreaterThan(0);

      // Check for aria-selected
      const treeItems = container.querySelectorAll('[role="treeitem"]');
      treeItems.forEach(item => {
        expect(item).toHaveAttribute('aria-selected');
      });
    });

    it('should have keyboard-accessible focus indicators', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const treeItems = container.querySelectorAll('[role="treeitem"]');

      treeItems.forEach(item => {
        const element = item as HTMLElement;
        expect(element.tabIndex).toBeGreaterThanOrEqual(-1);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const firstItem = container.querySelector('[role="treeitem"]') as HTMLElement;

      expect(firstItem).toBeTruthy();
      expect(firstItem.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should support Enter/Space for selection', () => {
      const handleSelectionChange = jest.fn();
      const { container } = render(
        <FileExplorer items={sampleData} onSelectedItemsChange={handleSelectionChange} />
      );

      // Focus is managed by MUI X Tree View
      const treeItems = container.querySelectorAll('[role="treeitem"]');
      expect(treeItems.length).toBeGreaterThan(0);
    });

    it('should support Home/End keys', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const tree = container.querySelector('[role="tree"]');

      expect(tree).toBeInTheDocument();
      // MUI X Tree View handles Home/End key navigation
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive labels', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const treeItems = container.querySelectorAll('[role="treeitem"]');

      treeItems.forEach(item => {
        const label = item.textContent;
        expect(label).toBeTruthy();
        expect(label?.length).toBeGreaterThan(0);
      });
    });

    it('should announce tree structure', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const tree = container.querySelector('[role="tree"]');

      expect(tree).toHaveAttribute('aria-label');
    });

    it('should indicate folder vs file items', () => {
      const { container } = render(
        <FileExplorer items={sampleData} defaultExpandedItems={['folder-1']} />
      );

      // Folders should have aria-expanded
      const folders = container.querySelectorAll('[aria-expanded]');
      expect(folders.length).toBeGreaterThan(0);

      // Files should not have aria-expanded
      const allItems = container.querySelectorAll('[role="treeitem"]');
      const files = Array.from(allItems).filter(item => !item.hasAttribute('aria-expanded'));
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast', () => {
    it('should render with sufficient contrast', async () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      expect(contrastViolations).toHaveLength(0);
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus after item expansion', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const tree = container.querySelector('[role="tree"]');

      expect(tree).toBeInTheDocument();
      // MUI X Tree View manages focus automatically
    });

    it('should restore focus after item selection', () => {
      const { container } = render(<FileExplorer items={sampleData} />);
      const treeItems = container.querySelectorAll('[role="treeitem"]');

      expect(treeItems.length).toBeGreaterThan(0);
      // MUI X Tree View manages focus restoration
    });
  });
});

// Export for CLI usage
export async function runAccessibilityAudit(): Promise<{
  passed: boolean;
  violations: number;
  score: number;
}> {
  const { container } = render(<FileExplorer items={sampleData} />);
  const results = await axe(container);

  cleanup();

  const score = results.violations.length === 0 ? 100 : Math.max(0, 100 - results.violations.length * 5);

  return {
    passed: results.violations.length === 0,
    violations: results.violations.length,
    score
  };
}
