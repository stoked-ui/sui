# Migrate File Explorer to MUI X Tree View

## 1. Feature Overview
**Feature Name:** File Explorer Migration to MUI X Tree View
**Owner:** Stoked Consulting / Development Team
**Status:** Draft
**Target Release:** TBD

### Summary
Replace the current custom-built sui-file-explorer component with MUI X's professionally maintained RichTreeView component as the foundation, while preserving 100% feature parity for sui-editor integration. This migration reduces maintenance burden, leverages battle-tested accessibility and performance features, and positions the component for ongoing improvements through MUI X's ecosystem while maintaining backward compatibility.

---

## 2. Problem Statement
### What problem are we solving?
The current sui-file-explorer component is a fully custom implementation (~686 lines core + ~50 plugin files) that replicates functionality already available in MUI X Tree View. This creates unnecessary maintenance overhead, limits access to professional features (virtualization, accessibility enhancements), and requires constant alignment with MUI ecosystem updates.

### Who is affected?
- **Primary user:** Development team maintaining sui-file-explorer and sui-editor
- **Secondary users:**
  - End-users of sui-editor who benefit from improved performance and accessibility
  - Future contributors who need to understand and extend file explorer functionality
  - Documentation maintainers keeping customization examples current

### Why now?
MUI X Tree View has matured to offer comprehensive customization capabilities (https://mui.com/x/react-tree-view/rich-tree-view/customization/#file-explorer) that match our requirements. The strategic timing allows us to:
- Reduce technical debt before it compounds further
- Leverage MUI X's recent accessibility and performance improvements
- Simplify onboarding for developers familiar with MUI ecosystem
- Free development resources for sui-editor feature work rather than infrastructure maintenance

---

## 3. Goals & Success Metrics
### Goals
1. Achieve 100% feature parity with current FileExplorer implementation
2. Reduce custom codebase by minimum 40% through MUI X delegation
3. Maintain or exceed current test coverage (baseline: existing coverage)
4. Equal or better render performance for large file lists (1000+ items)
5. Zero breaking changes to sui-editor's FileExplorer integration API
6. Improve accessibility compliance through MUI X ARIA implementation

### Success Metrics (How we'll know it worked)
- **Feature completeness:** 100% of sui-editor integration tests pass without modification → target: PASS
- **Code reduction:** Custom component code lines → target: ≤400 lines (40%+ reduction from 686)
- **Test coverage:** Maintain baseline coverage → target: ≥ current coverage %
- **Performance:** Render time for 1000 files → target: ≤ current baseline ms
- **Integration stability:** Zero required changes to sui-editor codebase → target: 0 files modified
- **Bundle size:** Component bundle impact → target: neutral or reduced (MUI X already loaded)
- **Accessibility:** WCAG 2.1 AA compliance → target: automated audit score ≥ 95

---

## 4. User Experience & Scope
### In Scope
**Core Migration:**
- Replace custom FileExplorer root component with MUI X RichTreeView
- Preserve all 8 plugin functionalities:
  1. **useFileExplorerFiles** - File data management and operations
  2. **useFileExplorerExpansion** - Folder expand/collapse behavior
  3. **useFileExplorerSelection** - Single/multi-select with checkbox support
  4. **useFileExplorerFocus** - Keyboard focus management
  5. **useFileExplorerKeyboardNavigation** - Arrow key navigation
  6. **useFileExplorerIcons** - File type icon rendering
  7. **useFileExplorerGrid** - Grid view with headers and columns
  8. **useFileExplorerDnd** - Drag and drop (internal/external/trash)

**Feature Preservation:**
- Grid view mode with customizable headers and column widths
- Drag and drop: internal item movement, external file drops, trash integration
- File operations: add files handler, double-click callbacks, dynamic file icons
- All existing prop interfaces and callbacks
- Current slot customization patterns
- Existing CSS customization hooks

**Integration Stability:**
- Maintain FileExplorerProps<Multiple> generic API
- Preserve all PropTypes and TypeScript interfaces
- Keep ref forwarding and imperative API surface
- Maintain FileExplorerProvider context structure for sui-editor

### Out of Scope
- **FileExplorerTabs component** - separate enhancement effort, not part of core migration
- **New features beyond current functionality** - focus is parity, not enhancement
- **Breaking changes to public API** - internal refactor only, external API frozen
- **sui-editor modifications** - must work with existing editor integration unchanged
- **FileExplorerBasic component migration** - evaluate separately after core migration

---

## 5. Assumptions & Constraints
### Assumptions
- MUI X Tree View customization APIs remain stable during migration period
- Current test suite accurately reflects required functionality
- sui-editor's FileExplorer usage is fully captured in existing integration tests
- MUI X virtualization features will improve performance without custom optimization
- Team has capacity for 2-4 week migration effort (single developer or pair)

### Constraints
**Technical:**
- Must work with current MUI v5 ecosystem (not v6 beta)
- TypeScript strict mode compliance required
- React 18.3.1 compatibility (per package.json peer deps)
- No new major dependencies beyond @mui/x-tree-view
- Custom plugin architecture must remain extensible for future needs

**API Compatibility:**
- Zero breaking changes to FileExplorerProps interface
- Preserve all callback signatures (onItemDoubleClick, onAddFiles, etc.)
- Maintain slot props structure for customization
- Keep ref API surface (useFileExplorerApiRef methods)

**Timeline:**
- Complete migration before next major sui-editor release
- Incremental rollout preferred over big-bang replacement
- Allow 1-2 weeks for stabilization and edge case testing

**Resources:**
- Single developer or small team (2 people max)
- Limited design review capacity - must match existing UX exactly
- No dedicated QA - rely on automated tests + manual spot checks

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **MUI X customization limits** - RichTreeView may not support exact custom grid layout with headers | HIGH - Could block migration entirely if grid view requires full custom implementation | Prototype grid view integration early (week 1). Have fallback plan to wrap RichTreeView with grid layout container if needed. Reference MUI X customization examples. |
| **Drag & Drop complexity** - MUI X may not provide DnD hooks compatible with current trash/external drop patterns | HIGH - DnD is critical sui-editor feature, cannot compromise | Investigate MUI X DnD plugin compatibility with FileExplorerDndContext early. May need to maintain custom DnD layer on top of MUI X tree structure. |
| **Plugin architecture incompatibility** - Current plugin system may not align with MUI X extension patterns | MEDIUM - Could require significant refactor, delaying timeline | Map existing plugins to MUI X slot/hook patterns in planning phase. Design adapter layer if architectures diverge significantly. |
| **Performance regression** - MUI X overhead could slow render for large file sets | MEDIUM - Would undermine key migration benefit | Benchmark current performance baseline. Add performance tests to CI. Profile MUI X virtualization early. |
| **Undiscovered sui-editor dependencies** - Hidden coupling beyond known integration points | MEDIUM - Late discovery could require API changes | Audit sui-editor codebase for FileExplorer usage patterns. Run integration tests continuously during migration. |
| **Test coverage gaps** - Current tests may not catch regressions in edge cases | MEDIUM - Could ship broken functionality | Expand test coverage before migration. Add visual regression tests for complex interactions. |
| **Bundle size increase** - MUI X may add unexpected bundle weight | LOW - Usually MUI X shared with other components | Analyze bundle impact early with webpack-bundle-analyzer. MUI X likely already loaded by MUI ecosystem. |
| **TypeScript type complexity** - Generic types may conflict with MUI X patterns | LOW - Could slow development but not block | Use type adapters to bridge MUI X and custom types. Leverage TypeScript utility types. |

---

## 7. Dependencies
**Internal Dependencies:**
- **sui-editor package** - Must continue working without modifications during and after migration
- **Test infrastructure** - Requires stable test environment for regression detection
- **Documentation system** - Examples and API docs need updating post-migration

**External Dependencies:**
- **@mui/x-tree-view** - New package dependency, version aligned with existing MUI v5 stack
- **@mui/material v5.15.21+** - Already peer dependency, ensure compatibility
- **React 18.3.1** - Current peer dependency, no change needed

**Development Dependencies:**
- **TypeScript compiler** - Type checking for MUI X integration
- **Testing libraries** - @stoked-ui/internal-test-utils for conformance tests
- **Build tooling** - Ensure tree-shaking works with MUI X patterns

**Knowledge Dependencies:**
- **MUI X Tree View documentation** - Primary reference for customization patterns
- **MUI X customization examples** - Specifically file explorer pattern (linked in problem statement)
- **Current FileExplorer plugin architecture** - Deep understanding required for migration

---

## 8. Open Questions
1. **Grid Layout Integration:** Does MUI X RichTreeView support custom grid layouts with synchronized column headers, or do we need a wrapper component? (Requires prototype investigation)

2. **Plugin Adapter Pattern:** What's the cleanest pattern to bridge our 8 existing plugins with MUI X's extension system? Should we maintain current plugin architecture as adapter layer or fully refactor to MUI X patterns?

3. **DnD Context Sharing:** How does FileExplorerDndContext integrate with MUI X's tree structure? Can we preserve current DnD context provider pattern or need architecture change?

4. **Performance Baseline:** What are current render times for 100/1000/5000 files to establish performance regression thresholds? (Needs measurement before migration starts)

5. **Test Coverage Baseline:** What is current test coverage percentage to ensure we maintain or exceed it? (Needs metrics collection)

6. **Virtualization Trade-offs:** Does MUI X virtualization require changes to how we handle dynamic file additions or double-click handlers? Any behavioral differences to document?

7. **Migration Strategy:** Should we migrate incrementally (feature-by-feature) or do full replacement? What's the rollback plan if critical issues emerge mid-migration?

8. **Bundle Impact:** Exact bundle size delta when adding @mui/x-tree-view dependency? Is tree-shaking effective with our usage pattern?

9. **Accessibility Audit:** What specific WCAG 2.1 AA criteria does current implementation fail that MUI X addresses? (Baseline accessibility audit needed)

10. **FileExplorerBasic Migration:** Should FileExplorerBasic follow same migration path or remain custom? Does it share enough code to benefit from this work?

---

## 9. Non-Goals
**Explicitly excluded from this migration:**

1. **New Features** - No adding capabilities beyond current FileExplorer functionality. Enhancements are separate post-migration efforts.

2. **FileExplorerTabs Migration** - Tabs component is separate concern with different architecture. Evaluate independently after core migration proves successful.

3. **Breaking API Changes** - No modifications to public props, callbacks, or TypeScript interfaces. Internal refactor only.

4. **sui-editor Refactoring** - Editor package must work as-is. Any editor improvements are follow-up work.

5. **FileExplorerBasic Component** - Basic variant is separate evaluation. This focuses on full-featured FileExplorer only.

6. **MUI v6 Upgrade** - Stay on current MUI v5 ecosystem. Version upgrades are orthogonal efforts.

7. **Design System Changes** - Match existing visual design exactly. No UI/UX redesign even if MUI X offers alternatives.

8. **Performance Optimization Beyond Baseline** - Goal is parity, not improvement. Optimizations are post-migration work.

9. **Third-party DnD Libraries** - Use MUI X patterns or maintain current approach. No introducing react-dnd, dnd-kit, etc.

10. **Documentation Rewrite** - Update existing docs for accuracy, but no comprehensive documentation overhaul.

---

## 10. Notes & References
**Technical References:**
- [MUI X Tree View Customization - File Explorer Pattern](https://mui.com/x/react-tree-view/rich-tree-view/customization/#file-explorer) - Primary implementation reference
- [MUI X RichTreeView API Documentation](https://mui.com/x/api/tree-view/rich-tree-view/) - Complete API surface
- [Current FileExplorer Implementation](/Users/stoked/work/stoked-ui/packages/sui-file-explorer/src/FileExplorer/FileExplorer.tsx) - 686 lines to migrate
- [Current Plugin Architecture](/Users/stoked/work/stoked-ui/packages/sui-file-explorer/src/FileExplorer/FileExplorer.plugins.ts) - 8 plugins to preserve

**Implementation Context:**
- Current codebase: ~686 lines in core FileExplorer component + ~50 plugin files
- Plugin architecture leverages composable hooks pattern (useFileExplorer with plugin array)
- Grid view uses custom FileExplorerGridHeaders component with dynamic column width management
- DnD system uses custom context (FileExplorerDndContext) with internal/external/trash support
- Test coverage includes conformance tests and plugin-specific test suites

**Strategic Context:**
- This migration aligns with broader strategy to leverage MUI ecosystem rather than maintain parallel implementations
- Success here creates template for potential migration of other custom MUI-adjacent components
- Reduces onboarding friction for developers familiar with MUI patterns
- Positions codebase for easier adoption of future MUI X enhancements (accessibility, performance)

**Similar Work:**
- Consider reviewing how MUI X migrated their own components to identify patterns
- Reference other Stoked UI components that successfully integrate MUI X patterns
- Look at community examples of extending RichTreeView for complex use cases

**Success Criteria Summary:**
This migration succeeds when sui-editor continues working without changes, all tests pass, codebase is measurably smaller, and team can point to MUI X documentation instead of maintaining custom implementation docs. Failure looks like: breaking changes required in sui-editor, performance regressions, or discovering MUI X limitations requiring fallback to mostly-custom implementation.
