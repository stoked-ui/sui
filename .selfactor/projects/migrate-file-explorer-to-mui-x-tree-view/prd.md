# Product Requirements Document: Migrate File Explorer to MUI X Tree View

## 0. Source Context
**Derived From:** Feature Brief - `./projects/migrate-file-explorer-to-mui-x-tree-view/pfb.md`
**Feature Name:** File Explorer Migration to MUI X Tree View
**PRD Owner:** Development Team
**Last Updated:** 2026-01-14

### Feature Brief Summary
Replace the custom-built sui-file-explorer component (~686 core lines + ~50 plugin files) with MUI X's RichTreeView component as the foundation while preserving 100% feature parity. This migration reduces maintenance burden by minimum 40% code reduction, leverages professionally maintained accessibility and performance features, and maintains zero breaking changes to sui-editor integration. Critical success factors: all 8 plugins preserved (Files, Expansion, Selection, Focus, Keyboard Navigation, Icons, Grid, Drag & Drop), complete sui-editor integration test pass without editor modifications, and performance parity for 1000+ file scenarios.

---

## 1. Objectives & Constraints

### Objectives
1. Achieve 100% feature parity with current FileExplorer implementation - all functionality preserved
2. Reduce custom codebase by minimum 40% (from 686 lines to ≤400 lines) through MUI X delegation
3. Maintain zero breaking changes to FileExplorerProps API and sui-editor integration
4. Equal or better render performance for large file lists (1000+ items baseline)
5. Improve accessibility compliance through MUI X ARIA implementation (≥95% automated audit score)
6. Preserve all 8 plugin functionalities with clean adapter layer to MUI X patterns

### Constraints
**Technical:**
- Must work with current MUI v5 ecosystem (not v6 beta)
- TypeScript strict mode compliance required
- React 18.3.1 compatibility per package.json peer dependencies
- No new major dependencies beyond @mui/x-tree-view
- Custom plugin architecture must remain extensible for future needs

**API Compatibility:**
- Zero breaking changes to FileExplorerProps<Multiple> generic interface
- Preserve all callback signatures (onItemDoubleClick, onAddFiles, etc.)
- Maintain slot props structure for customization
- Keep ref API surface (useFileExplorerApiRef methods)
- Maintain FileExplorerProvider context structure for sui-editor

**Integration:**
- sui-editor package must continue working without modifications during and after migration
- All existing sui-editor integration tests must pass without changes
- No modifications to EditorFileTabs, Editor, or useEditor implementations

**Timeline & Resources:**
- Complete migration before next major sui-editor release
- Single developer or small team (2 people max)
- Allow 1-2 weeks for stabilization and edge case testing
- Incremental rollout preferred over big-bang replacement

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Foundation Analysis & Strategy

**Purpose:** Establish baseline understanding of current implementation, MUI X capabilities, and migration risks before making any code changes. This phase must complete first to inform architectural decisions, identify blockers early, and establish measurable success criteria that subsequent phases will validate against.

### 1.1 Current Implementation Audit

Document the complete current FileExplorer architecture including all 8 plugins, their interdependencies, public API surface, and sui-editor integration points to establish the migration scope and identify potential compatibility issues.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/FileExplorer/` - Core component (686 lines)
  - `/packages/sui-file-explorer/src/internals/plugins/` - 8 plugin implementations (~50 files)
  - `/packages/sui-editor/src/` - Integration points (EditorFileTabs, Editor, useEditor)
- **Inputs:** Source code files, TypeScript interfaces, test suites
- **Outputs:**
  - Documentation file: `./projects/migrate-file-explorer-to-mui-x-tree-view/current-architecture.md`
  - Plugin dependency map showing hook call order and state sharing patterns
  - Public API inventory (props, callbacks, refs, context providers)
  - sui-editor integration contract specification
- **Core logic:**
  - Map all 8 plugins to their parameter interfaces, state management, and hook return values
  - Document FileExplorerProvider context structure and consumer patterns in sui-editor
  - Identify all PropTypes, TypeScript generics, and slot customization points
  - Extract callback signatures and event handler patterns
- **Failure modes:**
  - Missing undocumented plugins or hidden dependencies
  - Incomplete understanding of plugin interdependencies causing later architecture conflicts
  - Overlooked sui-editor integration points leading to breaking changes

**Acceptance Criteria**
- AC-1.1.a: When current plugin patterns are documented → documentation file contains all 8 plugin interfaces with parameter types, state management patterns, and hook return values
- AC-1.1.b: When public API is inventoried → documentation lists every prop in FileExplorerProps, every callback signature, and every ref method with TypeScript types
- AC-1.1.c: When sui-editor integration is mapped → documentation identifies all FileExplorerProvider consumers, all props passed from Editor/EditorFileTabs, and all event handlers
- AC-1.1.d: When plugin dependencies are analyzed → dependency graph shows plugin initialization order, shared state access patterns, and cross-plugin communication mechanisms

**Acceptance Tests**
- Test-1.1.a: Documentation review confirms all 8 plugins documented with complete interface specifications
- Test-1.1.b: API inventory cross-referenced against FileExplorer.tsx and FileExplorer.types.ts shows 100% coverage of exported types
- Test-1.1.c: sui-editor codebase grep for "FileExplorer" matches all integration points listed in documentation
- Test-1.1.d: Plugin dependency graph validated by reviewing plugin hook call order in useFileExplorer.ts

---

### 1.2 MUI X Capability Assessment

Prototype MUI X RichTreeView to verify it supports all critical FileExplorer features, especially high-risk areas (grid layout with headers, drag & drop patterns, plugin architecture compatibility), to identify blockers before committing to migration.

**Implementation Details**
- **Systems affected:**
  - Prototype environment (isolated from production codebase)
  - @mui/x-tree-view package integration
  - Test harness for feature validation
- **Inputs:**
  - MUI X RichTreeView documentation and examples
  - Current FileExplorer feature requirements from 1.1
  - High-risk feature list: grid view with column headers, drag & drop (internal/external/trash), plugin hook patterns
- **Outputs:**
  - Prototype code repository: `./projects/migrate-file-explorer-to-mui-x-tree-view/prototypes/`
  - Compatibility report: `./projects/migrate-file-explorer-to-mui-x-tree-view/mui-x-compatibility.md`
  - Risk assessment update with prototype findings
- **Core logic:**
  - Build isolated prototype demonstrating: basic tree rendering, custom grid layout with synchronized headers, drag & drop with external drop zones, slot customization patterns
  - Test MUI X extension points (slots, slotProps, hooks) against our 8 plugin patterns
  - Measure baseline performance with 1000+ items using MUI X virtualization
  - Validate TypeScript generic compatibility with FileExplorerProps<Multiple>
- **Failure modes:**
  - MUI X cannot support grid layout with headers → requires fallback wrapper component
  - MUI X DnD hooks incompatible with FileExplorerDndContext → requires custom DnD layer
  - MUI X plugin architecture fundamentally different → requires significant adapter layer
  - Performance regression below acceptable threshold → requires optimization strategy

**Acceptance Criteria**
- AC-1.2.a: When grid view is prototyped → MUI X RichTreeView renders items in multi-column grid layout with synchronized column headers OR compatibility report documents wrapper component approach
- AC-1.2.b: When drag & drop is prototyped → MUI X supports internal item reordering AND external file drops AND trash drop zone patterns OR compatibility report documents custom DnD integration strategy
- AC-1.2.c: When plugin patterns are tested → MUI X extension APIs (slots, hooks) can implement equivalent of at least 6 of 8 current plugins OR compatibility report identifies which 2 plugins require custom adapter layer
- AC-1.2.d: When performance is benchmarked → MUI X RichTreeView renders 1000 items in ≤ current baseline render time (measured in 1.3) OR performance report documents optimization plan
- AC-1.2.e: When TypeScript compatibility is validated → MUI X generic types integrate with FileExplorerProps<Multiple> without type errors OR compatibility report documents type adapter pattern

**Acceptance Tests**
- Test-1.2.a: Prototype code successfully renders grid view with headers and items align correctly across header/body OR compatibility document exists with wrapper component design
- Test-1.2.b: Prototype code demonstrates dragging item within tree, dropping external file, and dropping to trash OR compatibility document exists with DnD integration architecture
- Test-1.2.c: Prototype implements 6 of 8 plugins using MUI X patterns with code examples OR compatibility document lists 2 plugins requiring adapters with justification
- Test-1.2.d: Performance test script shows MUI X prototype render time ≤ baseline OR performance document contains optimization strategy with target metrics
- Test-1.2.e: TypeScript compilation succeeds with strict mode on prototype using FileExplorerProps<Multiple> pattern OR type adapter code exists with documentation

---

### 1.3 Performance & Test Baseline Establishment

Measure current FileExplorer performance metrics and test coverage to establish objective regression detection thresholds before migration begins.

**Implementation Details**
- **Systems affected:**
  - Current FileExplorer component in packages/sui-file-explorer
  - Test suite in packages/sui-file-explorer/src/FileExplorer/FileExplorer.test.tsx
  - Performance testing infrastructure
- **Inputs:**
  - Current FileExplorer implementation
  - Test datasets (100, 1000, 5000 file scenarios)
  - Coverage reporting tools (c8, istanbul)
- **Outputs:**
  - Performance baseline report: `./projects/migrate-file-explorer-to-mui-x-tree-view/baseline-performance.md`
  - Test coverage baseline report: `./projects/migrate-file-explorer-to-mui-x-tree-view/baseline-coverage.md`
  - Regression detection configuration files for CI
- **Core logic:**
  - Run performance profiling: initial render time, expansion time, selection time for 100/1000/5000 files
  - Measure memory footprint during operations
  - Generate test coverage report with line/branch/function percentages
  - Document specific test scenarios that must continue passing (sui-editor integration tests)
  - Configure performance budgets in CI (e.g., render time < X ms for 1000 files)
- **Failure modes:**
  - Inconsistent performance measurements due to environmental factors
  - Test coverage tools misconfigured or incomplete
  - Missing critical test scenarios not captured in coverage metrics

**Acceptance Criteria**
- AC-1.3.a: When performance is measured → baseline report documents render times for 100/1000/5000 files with mean and p95 values from ≥10 runs
- AC-1.3.b: When memory is profiled → baseline report documents peak memory usage during typical operations (expand all, select all, drag operations)
- AC-1.3.c: When test coverage is measured → baseline report shows line coverage %, branch coverage %, and function coverage % for FileExplorer core and all 8 plugins
- AC-1.3.d: When sui-editor integration tests are inventoried → baseline report lists all integration test cases that must pass post-migration without modification
- AC-1.3.e: When regression thresholds are configured → CI configuration includes performance budgets (render time, memory) and coverage minimums that will gate PRs

**Acceptance Tests**
- Test-1.3.a: Performance script runs successfully and generates report with render time data for all three file count scenarios with statistical variance <10%
- Test-1.3.b: Memory profiling script captures heap snapshots and report shows peak memory values for each operation type
- Test-1.3.c: Coverage report generation succeeds and report file contains percentage values for line/branch/function coverage
- Test-1.3.d: Integration test inventory script identifies all tests importing FileExplorer from sui-editor package and documents expected pass count
- Test-1.3.e: CI config file updated with performance budget values and PR check validates against thresholds

---

### 1.4 Migration Strategy & Architecture Design

Design the complete migration architecture including plugin adapter layer, component structure, rollback plan, and phased rollout strategy based on findings from 1.1-1.3.

**Implementation Details**
- **Systems affected:**
  - Future FileExplorer architecture (design only, no implementation yet)
  - Plugin adapter layer design
  - Rollout infrastructure planning
- **Inputs:**
  - Current architecture documentation from 1.1
  - MUI X compatibility assessment from 1.2
  - Performance and test baselines from 1.3
- **Outputs:**
  - Migration architecture document: `./projects/migrate-file-explorer-to-mui-x-tree-view/migration-architecture.md`
  - Plugin adapter design specifications for each of 8 plugins
  - Rollback plan and feature flag strategy
  - Phase 2-4 work breakdown with dependencies
- **Core logic:**
  - Design component hierarchy: how MUI X RichTreeView integrates with custom FileExplorer wrapper
  - Specify plugin adapter pattern: how existing plugin hooks map to MUI X extension points
  - Plan grid view integration: wrapper component vs native MUI X approach based on 1.2 findings
  - Design DnD integration: custom layer on MUI X vs native MUI X DnD based on 1.2 findings
  - Define feature flag strategy for incremental rollout
  - Document rollback triggers and procedure
- **Failure modes:**
  - Architecture design incompatible with MUI X constraints discovered later
  - Plugin adapter complexity underestimated leading to Phase 2 delays
  - Insufficient rollback plan causing production risk

**Acceptance Criteria**
- AC-1.4.a: When component architecture is designed → architecture document specifies how MUI X RichTreeView wraps/composes with FileExplorer, what components are replaced vs preserved, and component hierarchy diagram
- AC-1.4.b: When plugin adapters are specified → architecture document contains adapter design for all 8 plugins showing how each plugin's hooks/state map to MUI X patterns with code structure examples
- AC-1.4.c: When grid view strategy is defined → architecture document specifies grid implementation approach (wrapper component or native MUI X) with justification from 1.2 prototype findings
- AC-1.4.d: When DnD strategy is defined → architecture document specifies drag & drop implementation approach (custom context layer or native MUI X) with integration points to FileExplorerDndContext
- AC-1.4.e: When rollout plan is documented → architecture document includes feature flag configuration, incremental exposure plan (internal → beta → production), rollback triggers (performance regression >10%, test failures, critical bugs), and rollback procedure

**Acceptance Tests**
- Test-1.4.a: Architecture document review confirms component hierarchy is valid React component composition with clear parent-child relationships
- Test-1.4.b: Plugin adapter specifications reviewed for all 8 plugins with code examples showing hook mapping
- Test-1.4.c: Grid view approach decision documented with reference to 1.2 prototype results and technical justification
- Test-1.4.d: DnD approach decision documented with integration points to existing FileExplorerDndContext clearly specified
- Test-1.4.e: Rollout plan includes all required elements: feature flags, exposure stages, rollback triggers with thresholds, rollback procedure steps

---

## Phase 2: Core Migration & Plugin Adapter Foundation

**Purpose:** Replace the base FileExplorer component with MUI X RichTreeView and establish the plugin adapter architecture that subsequent features will build upon. This phase cannot start until Phase 1 architecture is validated because the adapter pattern must be designed against confirmed MUI X capabilities to avoid rework.

### 2.1 MUI X RichTreeView Integration

Replace the custom FileExplorer root component rendering logic with MUI X RichTreeView while preserving the existing FileExplorer public API surface and maintaining the plugin system interface.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/FileExplorer/FileExplorer.tsx` - Core component replacement
  - `/packages/sui-file-explorer/src/internals/useFileExplorer/` - Hook integration with MUI X
  - Package dependencies - Add @mui/x-tree-view to package.json
- **Inputs:**
  - Migration architecture from 1.4
  - Current FileExplorer.tsx implementation (686 lines)
  - MUI X RichTreeView API and customization patterns
- **Outputs:**
  - Refactored FileExplorer.tsx wrapping MUI X RichTreeView
  - Updated useFileExplorer hook to integrate with MUI X internal state
  - Adapter layer scaffolding for plugin integration
- **Core logic:**
  - Replace custom tree rendering logic with MUI X RichTreeView component
  - Preserve FileExplorerProps interface - all props either pass through to RichTreeView or handled by adapter layer
  - Maintain FileExplorerProvider context structure so sui-editor integration remains unchanged
  - Forward refs correctly to expose useFileExplorerApiRef methods
  - Integrate MUI X's internal state management with existing plugin system hooks
- **Failure modes:**
  - MUI X RichTreeView requires props incompatible with current FileExplorerProps
  - Context provider structure changes break sui-editor integration
  - Ref forwarding broken causing apiRef methods unavailable
  - MUI X internal state conflicts with plugin state management

**Acceptance Criteria**
- AC-2.1.a: When FileExplorer.tsx is refactored → component imports and renders MUI X RichTreeView AND FileExplorerProps interface unchanged AND TypeScript compilation succeeds with strict mode
- AC-2.1.b: When props are integrated → all current FileExplorerProps either map to RichTreeView props OR handled by adapter layer with mapping documented in code comments
- AC-2.1.c: When context is preserved → FileExplorerProvider exports same context shape as before migration AND sui-editor imports work without modification
- AC-2.1.d: When refs are forwarded → useFileExplorerApiRef hook returns ref object with all existing methods AND methods callable from external components
- AC-2.1.e: When @mui/x-tree-view is added → package.json includes dependency with version compatible with existing @mui/material v5.15.21+ AND npm install succeeds AND bundle size delta documented

**Acceptance Tests**
- Test-2.1.a: Unit test confirms FileExplorer component renders MUI X RichTreeView child component AND TypeScript compiler check passes
- Test-2.1.b: Type test validates FileExplorerProps type compatibility by assigning old props object to new component without errors
- Test-2.1.c: Integration test imports FileExplorerProvider from sui-editor and accesses context values without errors
- Test-2.1.d: Unit test calls all apiRef methods (from useFileExplorerApiRef) and verifies callable without errors
- Test-2.1.e: Build test runs npm install and webpack-bundle-analyzer confirms @mui/x-tree-view bundle impact documented in PR

---

### 2.2 Files Plugin Adapter

Implement the adapter layer for useFileExplorerFiles plugin to bridge current file data management patterns with MUI X's data handling, establishing the adapter pattern template that other 7 plugins will follow.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerFiles/` - Plugin implementation
  - MUI X RichTreeView items prop and data transformation
  - File operations: add files, item callbacks, dynamic updates
- **Inputs:**
  - Current useFileExplorerFiles plugin code and UseFileExplorerFilesParameters interface
  - MUI X RichTreeView items data structure requirements
  - Migration architecture plugin adapter specification from 1.4
- **Outputs:**
  - Refactored useFileExplorerFiles.ts with MUI X integration
  - Data transformation layer converting between FileExplorer file format and MUI X item format
  - File operation handlers adapted to MUI X state management
- **Core logic:**
  - Transform current file data structure to MUI X RichTreeView items format
  - Map onAddFiles callback to MUI X item addition patterns
  - Integrate onItemDoubleClick and other file event handlers with MUI X event system
  - Maintain file icon rendering through MUI X slot customization
  - Preserve dynamic file updates (add/remove/modify files) functionality
- **Failure modes:**
  - File data transformation loses metadata required by other plugins
  - MUI X item format incompatible with current file structure
  - Event handlers don't fire due to MUI X event propagation differences
  - Dynamic file updates don't trigger MUI X re-renders

**Acceptance Criteria**
- AC-2.2.a: When file data is transformed → useFileExplorerFiles converts current file objects to MUI X items format preserving all metadata (id, name, type, children, custom properties)
- AC-2.2.b: When onAddFiles callback fires → new files added through callback appear in tree AND MUI X internal state updated correctly
- AC-2.2.c: When onItemDoubleClick is triggered → double-clicking file item fires callback with correct file data matching current behavior
- AC-2.2.d: When files are dynamically updated → adding/removing/modifying files through API triggers MUI X re-render with updated tree structure
- AC-2.2.e: When plugin tests run → all existing useFileExplorerFiles test cases pass without modification

**Acceptance Tests**
- Test-2.2.a: Unit test validates file transformation by converting sample file array to MUI X items and verifying all properties preserved
- Test-2.2.b: Integration test calls onAddFiles callback and confirms new files rendered in tree component
- Test-2.2.c: Event test simulates double-click on file item and verifies callback fired with correct file object
- Test-2.2.d: State test adds/removes files via API and confirms MUI X tree re-renders showing changes
- Test-2.2.e: Test suite runs all useFileExplorerFiles tests and confirms 100% pass rate

---

### 2.3 Expansion Plugin Adapter

Implement the adapter layer for useFileExplorerExpansion plugin to integrate folder expand/collapse behavior with MUI X's expansion management system.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerExpansion/` - Plugin implementation
  - MUI X RichTreeView expansion props (expandedItems, onExpandedItemsChange)
  - Folder expand/collapse state synchronization
- **Inputs:**
  - Current useFileExplorerExpansion plugin code and UseFileExplorerExpansionParameters interface
  - MUI X expansion control patterns
  - Plugin adapter pattern from 2.2 (Files plugin)
- **Outputs:**
  - Refactored useFileExplorerExpansion.ts with MUI X integration
  - State synchronization between plugin expansion state and MUI X expandedItems
  - Expansion event handlers adapted to MUI X callbacks
- **Core logic:**
  - Map current expansion state management to MUI X expandedItems prop (controlled component pattern)
  - Integrate onExpandedItemsChange callback with plugin state updates
  - Preserve programmatic expansion API (expand/collapse methods on apiRef)
  - Maintain expansion persistence if currently implemented
  - Handle default expansion state initialization
- **Failure modes:**
  - State synchronization loop between plugin state and MUI X state
  - Programmatic expand/collapse methods don't trigger MUI X updates
  - Default expansion state not applied on initial render
  - Expansion persistence broken if implemented

**Acceptance Criteria**
- AC-2.3.a: When expansion state is synchronized → changes to plugin expansion state update MUI X expandedItems AND changes from MUI X onExpandedItemsChange update plugin state without infinite loops
- AC-2.3.b: When user clicks folder icon → folder expands/collapses AND expansion state persisted in plugin state AND MUI X internal state matches
- AC-2.3.c: When programmatic expansion API is used → calling apiRef.expand(itemId) or apiRef.collapse(itemId) triggers MUI X visual expansion/collapse
- AC-2.3.d: When default expansion is configured → defaultExpandedItems prop correctly initializes both plugin state and MUI X expandedItems on mount
- AC-2.3.e: When plugin tests run → all existing useFileExplorerExpansion test cases pass without modification

**Acceptance Tests**
- Test-2.3.a: State test verifies bidirectional synchronization by updating plugin state and confirming MUI X updates, then updating MUI X and confirming plugin updates, without infinite render loops
- Test-2.3.b: User interaction test simulates click on folder icon and verifies expansion state in both plugin and MUI X state
- Test-2.3.c: API test calls apiRef.expand() and apiRef.collapse() methods and confirms MUI X tree visually updates
- Test-2.3.d: Mount test renders component with defaultExpandedItems and verifies initial state matches in both systems
- Test-2.3.e: Test suite runs all useFileExplorerExpansion tests and confirms 100% pass rate

---

### 2.4 Selection & Focus Plugin Adapters

Implement adapter layers for useFileExplorerSelection and useFileExplorerFocus plugins to integrate selection state (single/multi-select with checkbox support) and keyboard focus management with MUI X patterns.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerSelection/` - Selection plugin
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerFocus/` - Focus plugin
  - MUI X selection props (selectedItems, onSelectedItemsChange, multiSelect)
  - MUI X focus management and ARIA attributes
- **Inputs:**
  - Current useFileExplorerSelection and useFileExplorerFocus plugin code
  - UseFileExplorerSelectionParameters<Multiple> generic interface
  - MUI X selection and focus patterns
- **Outputs:**
  - Refactored useFileExplorerSelection.ts with MUI X integration preserving Multiple generic
  - Refactored useFileExplorerFocus.ts with MUI X focus system integration
  - State synchronization for selection and focus
- **Core logic:**
  - **Selection:** Map plugin selection state to MUI X selectedItems prop, handle single vs multi-select based on Multiple generic, integrate checkbox rendering through slots, preserve onSelectedItemsChange callback signature
  - **Focus:** Integrate keyboard focus management with MUI X focus system, maintain ARIA attributes for accessibility, preserve focus state in plugin for external consumers
  - Coordinate selection and focus interactions (clicking item focuses and may select)
  - Handle edge cases: focus without selection, selection without focus, programmatic selection API
- **Failure modes:**
  - Multiple generic type compatibility breaks with MUI X selection patterns
  - Checkbox rendering slots incompatible with MUI X slot system
  - Focus and selection state desynchronization causing UX issues
  - ARIA attributes lost or incorrect after migration

**Acceptance Criteria**
- AC-2.4.a: When selection is synchronized → plugin selection state updates MUI X selectedItems AND MUI X onSelectedItemsChange updates plugin state maintaining Multiple generic type safety
- AC-2.4.b: When single vs multi-select is configured → Multiple generic correctly controls single vs multi-select behavior in MUI X AND checkbox rendering matches current behavior in multi-select mode
- AC-2.4.c: When focus is managed → clicking item focuses it in MUI X AND keyboard navigation updates focus state AND plugin focus state accessible to external consumers
- AC-2.4.d: When ARIA attributes are rendered → MUI X tree has correct aria-selected, aria-checked, aria-expanded attributes matching WCAG 2.1 AA requirements
- AC-2.4.e: When programmatic selection API is used → calling apiRef.selectItem()/deselectItem() triggers MUI X visual selection updates
- AC-2.4.f: When plugin tests run → all existing useFileExplorerSelection and useFileExplorerFocus test cases pass without modification

**Acceptance Tests**
- Test-2.4.a: Type test confirms UseFileExplorerSelectionParameters<true> and <false> compile correctly with MUI X integration AND state synchronization test verifies bidirectional updates
- Test-2.4.b: Multi-select test renders checkboxes and verifies multiple selection works AND single-select test verifies only one item selected at a time
- Test-2.4.c: Focus test simulates click and keyboard navigation (arrow keys) and verifies focus state updates in both plugin and MUI X
- Test-2.4.d: Accessibility test runs automated ARIA audit (axe-core) on rendered tree and confirms ≥95% score
- Test-2.4.e: API test calls programmatic selection methods and verifies MUI X visual updates
- Test-2.4.f: Test suite runs all useFileExplorerSelection and useFileExplorerFocus tests and confirms 100% pass rate

---

### 2.5 Keyboard Navigation & Icons Plugin Adapters

Implement adapter layers for useFileExplorerKeyboardNavigation and useFileExplorerIcons plugins to integrate arrow key navigation and file type icon rendering with MUI X patterns.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerKeyboardNavigation/` - Keyboard plugin
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerIcons/` - Icons plugin
  - MUI X keyboard event handling and ARIA navigation
  - MUI X slot customization for icon rendering
- **Inputs:**
  - Current useFileExplorerKeyboardNavigation and useFileExplorerIcons plugin code
  - MUI X keyboard navigation patterns and slot props
  - Icon rendering requirements (file type icons, folder icons, custom icons)
- **Outputs:**
  - Refactored useFileExplorerKeyboardNavigation.ts with MUI X keyboard event integration
  - Refactored useFileExplorerIcons.ts with MUI X slot-based icon rendering
  - Keyboard navigation behavior matching current implementation
  - Icon customization API preserved
- **Core logic:**
  - **Keyboard Navigation:** Map arrow key handlers to MUI X keyboard navigation system, preserve current navigation behavior (up/down for item focus, left/right for expand/collapse), integrate with focus plugin from 2.4, ensure ARIA keyboard navigation attributes
  - **Icons:** Integrate file type icon rendering through MUI X item slots, preserve icon customization API (custom icon prop, file type to icon mapping), maintain folder open/closed icon state synchronization with expansion state
- **Failure modes:**
  - MUI X keyboard handling conflicts with custom keyboard navigation logic
  - Icon slots incompatible with current icon customization patterns
  - Folder open/closed icon state desynchronization with expansion
  - Keyboard navigation breaks accessibility (screen reader compatibility)

**Acceptance Criteria**
- AC-2.5.a: When keyboard navigation is active → arrow up/down moves focus between items AND arrow left collapses folder AND arrow right expands folder matching current behavior
- AC-2.5.b: When keyboard navigation integrates with MUI X → MUI X internal focus management and plugin keyboard navigation work together without conflicts
- AC-2.5.c: When icons are rendered → file type icons display correctly through MUI X slots AND custom icon prop respected AND folder icons change between open/closed state based on expansion
- AC-2.5.d: When icon customization API is used → providing custom iconMap prop updates icons rendered in tree matching current customization behavior
- AC-2.5.e: When ARIA keyboard attributes are rendered → tree has correct aria-keyshortcuts and keyboard navigation accessible to screen readers
- AC-2.5.f: When plugin tests run → all existing useFileExplorerKeyboardNavigation and useFileExplorerIcons test cases pass without modification

**Acceptance Tests**
- Test-2.5.a: Keyboard test simulates arrow key presses and verifies focus movement and expansion/collapse behavior matches expected navigation
- Test-2.5.b: Integration test combines keyboard navigation with MUI X focus system and confirms no event conflicts or double-handling
- Test-2.5.c: Icon rendering test verifies file type icons render correctly AND folder icon changes when folder expanded/collapsed
- Test-2.5.d: Customization test provides custom iconMap prop and verifies custom icons rendered instead of defaults
- Test-2.5.e: Accessibility test validates keyboard navigation with screen reader simulation (axe-core keyboard checks)
- Test-2.5.f: Test suite runs all useFileExplorerKeyboardNavigation and useFileExplorerIcons tests and confirms 100% pass rate

---

## Phase 3: Advanced Features Implementation

**Purpose:** Implement the two most complex features (Grid view and Drag & Drop) that have highest risk of MUI X compatibility issues. This phase cannot start until Phase 2 core plugins are stable because grid and DnD features depend on working Files, Expansion, Selection, and Focus plugins as their foundation.

### 3.1 Grid View Plugin Adapter

Implement the adapter layer for useFileExplorerGrid plugin to integrate grid layout with column headers, synchronized scrolling, and customizable column widths with MUI X tree structure.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/` - Grid plugin
  - FileExplorerGridHeaders component integration with MUI X
  - Column header synchronization with tree items
  - CSS Grid or Table layout wrapper around MUI X RichTreeView
- **Inputs:**
  - Current useFileExplorerGrid plugin code and UseFileExplorerGridParameters interface
  - FileExplorerGridHeaders component implementation
  - Grid layout strategy from Phase 1.4 migration architecture
  - MUI X customization patterns for layout override
- **Outputs:**
  - Refactored useFileExplorerGrid.ts with MUI X integration
  - Grid wrapper component if needed (based on 1.2 prototype findings)
  - Column header synchronization logic
  - Column width customization API preserved
- **Core logic:**
  - Integrate grid layout: wrap MUI X RichTreeView with grid container OR use MUI X slot customization for grid rendering
  - Synchronize FileExplorerGridHeaders with tree items so columns align correctly
  - Preserve column width customization through props (headerColumns, columnWidths)
  - Maintain scrolling synchronization between headers and tree body
  - Handle dynamic column resizing if currently supported
- **Failure modes:**
  - Column header misalignment with tree items due to scrolling or virtualization
  - MUI X virtualization breaks grid layout assumptions
  - Column width changes don't propagate to both header and body
  - CSS Grid/Table layout conflicts with MUI X internal styling

**Acceptance Criteria**
- AC-3.1.a: When grid view is enabled → tree items render in multi-column grid layout with each column aligned to corresponding header column
- AC-3.1.b: When headers are rendered → FileExplorerGridHeaders component displays above tree AND columns align pixel-perfect with tree item columns
- AC-3.1.c: When scrolling occurs → horizontal scroll synchronizes between headers and tree body maintaining column alignment
- AC-3.1.d: When column widths are customized → providing columnWidths prop updates both header column widths and tree item column widths
- AC-3.1.e: When virtualization is active → MUI X virtualized rendering maintains grid layout and header alignment for 1000+ items
- AC-3.1.f: When plugin tests run → all existing useFileExplorerGrid test cases pass without modification

**Acceptance Tests**
- Test-3.1.a: Visual test renders grid view and verifies items displayed in columns with correct alignment
- Test-3.1.b: Layout test measures header column positions and tree item column positions and confirms alignment within 1px tolerance
- Test-3.1.c: Scroll test simulates horizontal scroll and verifies headers scroll synchronously with tree body
- Test-3.1.d: Customization test provides custom columnWidths and verifies both headers and items respect new widths
- Test-3.1.e: Performance test renders 1000 items in grid view with virtualization and confirms layout remains correct during scroll
- Test-3.1.f: Test suite runs all useFileExplorerGrid tests and confirms 100% pass rate

---

### 3.2 Drag & Drop Plugin Adapter

Implement the adapter layer for useFileExplorerDnd plugin to integrate drag and drop functionality (internal item movement, external file drops, trash drop zone) with MUI X tree structure while preserving FileExplorerDndContext integration.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/` - DnD plugin
  - FileExplorerDndContext provider integration
  - MUI X drag and drop hooks/events or custom DnD layer
  - External drop zone and trash integration patterns
- **Inputs:**
  - Current useFileExplorerDnd plugin code and UseFileExplorerDndParameters interface
  - FileExplorerDndContext current implementation
  - DnD integration strategy from Phase 1.4 migration architecture
  - MUI X drag and drop capabilities or custom layer design
- **Outputs:**
  - Refactored useFileExplorerDnd.ts with MUI X integration or custom DnD layer
  - FileExplorerDndContext preserved and integrated with new implementation
  - Internal item drag/drop behavior
  - External file drop handler integration
  - Trash drop zone integration
- **Core logic:**
  - Implement internal drag and drop: allow dragging tree items to reorder within tree structure
  - Integrate with MUI X tree item rendering for drag handles and drop indicators
  - Preserve FileExplorerDndContext for external consumers (sui-editor may depend on it)
  - Handle external file drops: dropping files from OS onto tree triggers onAddFiles
  - Integrate trash drop zone: dragging items to trash area triggers delete callback
  - Maintain drag preview customization if supported
- **Failure modes:**
  - MUI X virtualization breaks drag and drop event handling
  - FileExplorerDndContext incompatible with MUI X DnD patterns requiring breaking change
  - External file drop events not captured correctly
  - Trash drop zone positioning conflicts with grid layout
  - Drag preview rendering breaks with MUI X custom rendering

**Acceptance Criteria**
- AC-3.2.a: When items are dragged internally → dragging tree item and dropping on another item reorders items in tree structure AND triggers appropriate callbacks
- AC-3.2.b: When external files are dropped → dropping files from OS onto tree area triggers onAddFiles callback with file data
- AC-3.2.c: When items are dragged to trash → dragging tree item to trash drop zone triggers delete callback AND item removed from tree
- AC-3.2.d: When FileExplorerDndContext is used → context provider maintains same API surface AND external consumers (sui-editor if applicable) continue working without modification
- AC-3.2.e: When drag indicators are shown → MUI X tree displays visual feedback during drag (drop target highlighting, drag preview) matching current UX
- AC-3.2.f: When virtualization is active → drag and drop works correctly with virtualized tree (1000+ items)
- AC-3.2.g: When plugin tests run → all existing useFileExplorerDnd test cases pass without modification

**Acceptance Tests**
- Test-3.2.a: DnD test simulates dragging item to new position and verifies tree reorders correctly with callbacks fired
- Test-3.2.b: External drop test simulates OS file drop event and verifies onAddFiles callback receives correct file data
- Test-3.2.c: Trash test simulates dragging item to trash zone and verifies delete callback fired and item removed
- Test-3.2.d: Context test verifies FileExplorerDndContext exports same interface and integration test confirms external usage works
- Test-3.2.e: Visual test confirms drag indicators (drop target highlighting, drag ghost) render during drag operations
- Test-3.2.f: Performance test executes drag and drop on virtualized tree with 1000 items and confirms functionality works
- Test-3.2.g: Test suite runs all useFileExplorerDnd tests and confirms 100% pass rate

---

## Phase 4: Integration Validation & Rollout

**Purpose:** Validate complete sui-editor integration, run comprehensive performance and accessibility audits, and execute phased rollout. This phase cannot start until Phase 3 is complete because all 8 plugins must be functional before integration testing can prove zero breaking changes to sui-editor.

### 4.1 sui-editor Integration Testing

Run complete sui-editor integration test suite without modifications to editor codebase to prove zero breaking changes and validate FileExplorer migration success.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-editor/` - No code changes, testing only
  - `/packages/sui-file-explorer/` - Migrated FileExplorer as dependency
  - sui-editor integration test suite
- **Inputs:**
  - Migrated FileExplorer component from Phases 2-3
  - Existing sui-editor integration tests (identified in 1.3)
  - sui-editor source code (Editor, EditorFileTabs, useEditor)
- **Outputs:**
  - Integration test results report
  - Bug fixes for any breaking changes discovered
  - Validation that sui-editor requires zero modifications
- **Core logic:**
  - Run complete sui-editor test suite against migrated FileExplorer
  - Test all FileExplorer usage in Editor, EditorFileTabs, and useEditor components
  - Verify all props passed from sui-editor to FileExplorer still work correctly
  - Validate FileExplorerProvider context consumption in sui-editor
  - Test all callbacks and event handlers fired from FileExplorer to sui-editor
  - Confirm ref usage (apiRef) from sui-editor still functional
- **Failure modes:**
  - Integration tests fail revealing breaking changes in FileExplorer API
  - Context shape changed breaking sui-editor context consumers
  - Callbacks fired with different signatures breaking sui-editor handlers
  - Ref methods missing or signature changed breaking sui-editor programmatic control

**Acceptance Criteria**
- AC-4.1.a: When sui-editor integration tests run → 100% of existing integration tests pass without modification to sui-editor codebase
- AC-4.1.b: When Editor component is tested → Editor successfully imports and renders FileExplorer with all current props and functionality working
- AC-4.1.c: When EditorFileTabs component is tested → EditorFileTabs integration with FileExplorer works without modifications
- AC-4.1.d: When useEditor hook is tested → useEditor consumption of FileExplorer context and refs works correctly
- AC-4.1.e: When callbacks are verified → all FileExplorer callbacks (onItemDoubleClick, onAddFiles, etc.) fire with correct signatures expected by sui-editor handlers
- AC-4.1.f: When any breaking changes found → bugs fixed and tests re-run until 100% pass rate achieved

**Acceptance Tests**
- Test-4.1.a: Test suite runs all sui-editor integration tests and reports 100% pass rate with zero code changes to sui-editor
- Test-4.1.b: Integration test renders Editor component with FileExplorer and verifies all features functional (file selection, double-click, add files)
- Test-4.1.c: Integration test renders EditorFileTabs with FileExplorer integration and verifies tab switching and file management works
- Test-4.1.d: Hook test verifies useEditor correctly accesses FileExplorer context values and apiRef methods
- Test-4.1.e: Callback test instruments all callbacks and verifies signatures match expected types in sui-editor handlers
- Test-4.1.f: Regression test runs after each bug fix until zero failures remain

---

### 4.2 Performance & Accessibility Validation

Run comprehensive performance benchmarks and accessibility audits to validate migration meets success criteria: performance parity or improvement for 1000+ files and ≥95% WCAG 2.1 AA compliance.

**Implementation Details**
- **Systems affected:**
  - Migrated FileExplorer component
  - Performance testing infrastructure
  - Accessibility testing tools (axe-core, Lighthouse)
- **Inputs:**
  - Performance baseline from Phase 1.3
  - Accessibility requirements (≥95% automated audit score)
  - Test datasets (100, 1000, 5000 files)
- **Outputs:**
  - Performance comparison report (baseline vs post-migration)
  - Accessibility audit report with WCAG 2.1 AA compliance score
  - Performance optimization fixes if needed
  - Accessibility fixes if needed
- **Core logic:**
  - Run performance benchmarks: measure render times for 100/1000/5000 files with migrated component
  - Compare against baseline from 1.3: calculate percentage difference in render time, memory usage
  - Run accessibility audit with axe-core: check ARIA attributes, keyboard navigation, screen reader compatibility
  - Run Lighthouse accessibility audit for additional validation
  - If performance regression >10% or accessibility <95%, implement optimizations/fixes and re-test
- **Failure modes:**
  - Performance regression >10% requiring optimization work or architecture changes
  - Accessibility score <95% requiring ARIA attribute fixes or keyboard navigation improvements
  - Memory leaks or performance degradation not caught in baseline

**Acceptance Criteria**
- AC-4.2.a: When performance benchmarks run → migrated FileExplorer render times for 1000 files ≤ baseline + 10% (acceptable variance) OR better than baseline
- AC-4.2.b: When memory profiling runs → migrated FileExplorer peak memory usage for operations ≤ baseline + 10% OR better than baseline
- AC-4.2.c: When accessibility audit runs → axe-core automated audit score ≥ 95% for WCAG 2.1 AA compliance
- AC-4.2.d: When Lighthouse audit runs → accessibility score ≥ 95 confirming WCAG 2.1 AA compliance
- AC-4.2.e: When keyboard navigation is tested → all tree navigation accessible via keyboard without mouse (tab, arrow keys, enter, space) AND screen reader announces items correctly
- AC-4.2.f: When regressions found → performance or accessibility issues fixed and tests re-run until criteria met

**Acceptance Tests**
- Test-4.2.a: Performance test script runs benchmark suite and reports render times within acceptable variance of baseline (<10% regression)
- Test-4.2.b: Memory profiling script runs and reports peak memory usage within acceptable variance of baseline (<10% regression)
- Test-4.2.c: Accessibility test runs axe-core audit and reports score ≥95% with detailed violation report if below threshold
- Test-4.2.d: Lighthouse test runs accessibility audit and reports score ≥95
- Test-4.2.e: Manual keyboard test validates all navigation works without mouse and screen reader test confirms proper announcements
- Test-4.2.f: Regression fix loop continues until all performance and accessibility criteria met

---

### 4.3 Code Quality & Documentation

Validate code reduction target (≥40% reduction from 686 lines), update documentation to reflect MUI X integration, and prepare migration summary for team knowledge sharing.

**Implementation Details**
- **Systems affected:**
  - `/packages/sui-file-explorer/src/` - Code metrics analysis
  - `/packages/sui-file-explorer/docs/` - Documentation updates
  - Migration project documentation
- **Inputs:**
  - Migrated FileExplorer codebase
  - Current codebase line count baseline (686 core + ~50 plugin files from Phase 1.1)
  - Documentation templates and existing docs
- **Outputs:**
  - Code metrics report showing line count reduction
  - Updated FileExplorer documentation referencing MUI X patterns
  - Migration summary document for team
  - Updated code examples showing MUI X integration
- **Core logic:**
  - Count lines of code in migrated FileExplorer core and plugins (exclude comments/blank lines)
  - Calculate percentage reduction from baseline 686 lines
  - Update documentation: replace custom implementation details with MUI X references, update examples to show MUI X integration patterns, document plugin adapter layer
  - Create migration summary: lessons learned, architecture decisions, MUI X integration patterns, future enhancement opportunities
- **Failure modes:**
  - Code reduction <40% indicating insufficient delegation to MUI X
  - Documentation incomplete or inaccurate causing developer confusion
  - Migration knowledge not captured for future reference

**Acceptance Criteria**
- AC-4.3.a: When code metrics are measured → migrated FileExplorer core ≤400 lines (≥40% reduction from 686 baseline) excluding comments and blank lines
- AC-4.3.b: When plugin line counts are measured → total plugin code reduced through MUI X delegation with metrics documented in report
- AC-4.3.c: When documentation is updated → FileExplorer docs reference MUI X RichTreeView as foundation, explain plugin adapter layer, and include code examples showing MUI X integration
- AC-4.3.d: When migration summary is created → document includes architecture decisions, lessons learned, MUI X integration patterns, and future enhancement opportunities
- AC-4.3.e: When code examples are updated → all documentation examples use migrated FileExplorer API and demonstrate MUI X customization patterns

**Acceptance Tests**
- Test-4.3.a: Code metrics script counts lines in FileExplorer.tsx (excluding comments/blanks) and confirms ≤400 lines
- Test-4.3.b: Plugin metrics script totals plugin line counts and compares to baseline from 1.1 confirming reduction
- Test-4.3.c: Documentation review confirms MUI X references present, plugin adapter explanation exists, and examples accurate
- Test-4.3.d: Migration summary document exists with all required sections (architecture, lessons, patterns, future)
- Test-4.3.e: Documentation examples compile and run successfully demonstrating migrated FileExplorer usage

---

### 4.4 Phased Rollout & Monitoring

Execute incremental rollout using feature flags to safely expose migrated FileExplorer to users while monitoring for issues and maintaining rollback capability.

**Implementation Details**
- **Systems affected:**
  - Feature flag configuration system
  - Production deployment infrastructure
  - Monitoring and logging systems
- **Inputs:**
  - Rollout plan from Phase 1.4
  - Migrated FileExplorer validated through 4.1-4.3
  - Feature flag infrastructure
  - Rollback procedure from 1.4
- **Outputs:**
  - Feature flag configuration files
  - Monitoring dashboards for FileExplorer metrics
  - Rollout schedule and exposure percentages
  - Incident response runbook for rollback
- **Core logic:**
  - Configure feature flag: "use-mui-x-file-explorer" defaulting to false
  - Phase 1: Enable for internal development/testing environments only
  - Phase 2: Enable for beta users or canary deployment (5-10% traffic)
  - Phase 3: Gradual rollout to production (25% → 50% → 100% over days)
  - Monitor metrics: error rates, performance metrics, user feedback
  - Define rollback triggers: error rate spike >5%, performance regression >10%, critical bug reports
  - Execute rollback if triggers hit: disable feature flag, revert to original FileExplorer
- **Failure modes:**
  - Feature flag misconfiguration exposing migration to 100% immediately
  - Monitoring gaps missing critical issues during rollout
  - Rollback procedure fails leaving users on broken version
  - Production issues not caught in earlier testing phases

**Acceptance Criteria**
- AC-4.4.a: When feature flag is configured → "use-mui-x-file-explorer" flag exists with default false AND can be toggled per environment
- AC-4.4.b: When internal rollout executes → migrated FileExplorer enabled in dev/staging environments AND team validates functionality over ≥2 days
- AC-4.4.c: When beta rollout executes → 5-10% of production traffic uses migrated FileExplorer AND monitoring shows no error rate increase or performance regression
- AC-4.4.d: When production rollout executes → gradual exposure to 25% → 50% → 100% over scheduled timeline AND each phase monitored for issues
- AC-4.4.e: When monitoring is active → dashboards track FileExplorer error rates, render times, and user interactions with alerts configured for rollback triggers
- AC-4.4.f: When rollback capability verified → rollback procedure documented and tested in staging environment successfully reverting to original FileExplorer

**Acceptance Tests**
- Test-4.4.a: Configuration test verifies feature flag exists in config system and toggles correctly in test environment
- Test-4.4.b: Internal rollout test enables flag in staging and team manually validates all FileExplorer features over 2-day period
- Test-4.4.c: Beta rollout test exposes to 10% traffic and monitoring confirms error rates and performance within acceptable thresholds
- Test-4.4.d: Production rollout test follows phased schedule (25%/50%/100%) with monitoring validation at each phase
- Test-4.4.e: Monitoring test confirms dashboards display FileExplorer metrics and alerts trigger correctly when thresholds exceeded in test scenario
- Test-4.4.f: Rollback test executes rollback procedure in staging environment and verifies original FileExplorer restored successfully

---

## 3. Completion Criteria

The migration project is considered complete when all of the following conditions are met:

### Phase Completion
- ✅ All Phase 1 acceptance criteria pass (Foundation Analysis & Strategy)
- ✅ All Phase 2 acceptance criteria pass (Core Migration & Plugin Adapter Foundation)
- ✅ All Phase 3 acceptance criteria pass (Advanced Features Implementation)
- ✅ All Phase 4 acceptance criteria pass (Integration Validation & Rollout)

### Feature Parity
- ✅ 100% of sui-editor integration tests pass without modification to editor codebase
- ✅ All 8 plugins functional with MUI X integration: Files, Expansion, Selection, Focus, Keyboard Navigation, Icons, Grid, Drag & Drop
- ✅ FileExplorerProps<Multiple> API preserved with zero breaking changes
- ✅ All callbacks, refs, and context providers maintain original signatures

### Quality Metrics
- ✅ Code reduction: Core FileExplorer ≤400 lines (≥40% reduction from 686 baseline)
- ✅ Test coverage: ≥baseline coverage percentage maintained with all existing tests passing
- ✅ Performance: Render time for 1000 files ≤ baseline + 10% (acceptable variance)
- ✅ Accessibility: WCAG 2.1 AA compliance ≥95% automated audit score (axe-core + Lighthouse)

### Production Readiness
- ✅ Feature flag rollout completed to 100% production traffic without rollback triggers
- ✅ No P0 or P1 issues open related to FileExplorer migration
- ✅ Documentation updated with MUI X references and migration guide
- ✅ Team knowledge sharing completed (migration summary document published)

### Post-Launch Stability (2 week observation period)
- ✅ Error rates remain within baseline ±5% variance
- ✅ Performance metrics stable within baseline ±10% variance
- ✅ No critical user-reported bugs related to FileExplorer functionality
- ✅ Monitoring dashboards green with no alert triggers

---

## 4. Rollout & Validation

### Rollout Strategy

**Feature Flag Approach:**
- Flag name: `use-mui-x-file-explorer`
- Default state: `false` (original FileExplorer)
- Configuration: Environment-level toggle (dev, staging, production)
- Fallback: Automatic rollback to original implementation on flag disable

**Phased Rollout Schedule:**

| Phase | Environment | Traffic % | Duration | Success Criteria |
|-------|-------------|-----------|----------|------------------|
| 1. Internal | Dev/Staging | 100% | 2-3 days | Team manual validation, zero blocking bugs |
| 2. Beta | Production Beta | 5-10% | 3-5 days | Error rates ≤ baseline, performance ≤ baseline + 10% |
| 3. Canary | Production | 25% | 2-3 days | No error spikes, no user escalations |
| 4. Gradual | Production | 50% | 2-3 days | Metrics stable, monitoring green |
| 5. Full | Production | 100% | Ongoing | 2-week observation for stability |

**Progressive Exposure Controls:**
- Ability to increase/decrease traffic percentage dynamically
- Per-user sticky sessions to prevent UI thrashing during rollout
- Emergency kill switch for immediate rollback to 0% exposure

### Post-Launch Validation

**Metrics to Monitor:**

1. **Error Rates:**
   - JavaScript errors in FileExplorer component
   - React rendering errors and boundary triggers
   - Network errors if file operations involve API calls
   - Alert trigger: Error rate increase >5% from baseline

2. **Performance Metrics:**
   - Render time for 1000 files (p50, p95, p99 percentiles)
   - Time to interactive after FileExplorer mount
   - Memory usage peak during operations
   - Virtualization scroll performance (frame rate)
   - Alert trigger: p95 render time >baseline + 10%

3. **User Engagement:**
   - FileExplorer feature usage rates (expansion, selection, drag & drop)
   - User abandonment rate (closing FileExplorer without interaction)
   - Feature-specific metrics (grid view usage, DnD success rate)
   - Alert trigger: Feature usage drop >15% from baseline

4. **Accessibility Metrics:**
   - Keyboard navigation usage patterns
   - Screen reader session counts
   - ARIA attribute validation (continuous automated checks)
   - Alert trigger: Accessibility errors detected in production

**Monitoring Dashboards:**
- Real-time error rate graph with baseline comparison
- Performance percentile graphs (p50, p95, p99)
- Feature usage breakdown by plugin (expansion, selection, DnD, grid)
- Rollout status: current traffic percentage and phase
- Health indicators: green/yellow/red status per metric category

**Rollback Triggers:**

| Trigger | Threshold | Action | Responsibility |
|---------|-----------|--------|----------------|
| Error rate spike | >5% increase from baseline | Immediate rollback to previous phase | On-call engineer |
| Performance regression | p95 render time >baseline + 20% | Rollback to previous phase within 1 hour | Engineering lead |
| Critical bug report | P0 severity issue affecting core functionality | Immediate rollback to 0% | Product + Engineering |
| Multiple P1 bugs | ≥3 P1 issues within 24 hours | Pause rollout, fix, restart | Engineering team |
| Accessibility failure | WCAG violations in production audit | Rollback, fix, re-validate | Accessibility team |

**Rollback Procedure:**
1. **Immediate:** Disable feature flag (`use-mui-x-file-explorer = false`) in affected environment
2. **Validation:** Verify original FileExplorer rendering correctly for affected users
3. **Communication:** Notify team of rollback and trigger reason
4. **Root Cause Analysis:** Investigate trigger cause and document findings
5. **Fix & Re-test:** Implement fixes in dev/staging before attempting re-rollout
6. **Re-rollout:** Restart phased rollout from Phase 1 after fixes validated

**Success Criteria for Rollout Completion:**
- 100% production traffic on migrated FileExplorer
- 2 weeks of stable operation with no rollback triggers
- All monitoring metrics within acceptable variance (error rate ±5%, performance ±10%)
- Zero open P0/P1 issues related to migration
- Team confidence established for removing feature flag and decommissioning original code

---

## 5. Open Questions

### High Priority (Requires Resolution Before Phase 2)

1. **Grid Layout Integration Approach:**
   - **Question:** Does MUI X RichTreeView natively support custom grid layouts with synchronized column headers, or do we need a wrapper component approach?
   - **Impact:** Architecture decision for Phase 3.1 (Grid Plugin Adapter)
   - **Resolution Path:** Phase 1.2 prototype will answer this by implementing grid layout proof-of-concept
   - **Decision Maker:** Technical lead based on prototype findings
   - **Deadline:** End of Phase 1 (before Phase 2 begins)

2. **DnD Architecture Decision:**
   - **Question:** Can we integrate FileExplorerDndContext with MUI X's tree structure, or do we need a completely custom DnD layer on top of MUI X?
   - **Impact:** Architecture decision for Phase 3.2 (Drag & Drop Plugin Adapter)
   - **Resolution Path:** Phase 1.2 prototype will test DnD integration patterns with MUI X
   - **Decision Maker:** Technical lead based on prototype and context API compatibility analysis
   - **Deadline:** End of Phase 1 (before Phase 2 begins)

3. **Plugin Adapter Pattern:**
   - **Question:** Should we maintain current plugin architecture as adapter layer OR fully refactor plugins to native MUI X patterns?
   - **Impact:** Affects all Phase 2 plugin adapter work items (2.2-2.5)
   - **Resolution Path:** Phase 1.4 architecture design will specify adapter pattern based on MUI X extension API analysis
   - **Decision Maker:** Technical lead with team review
   - **Deadline:** End of Phase 1.4 (before Phase 2.1 begins)

### Medium Priority (Requires Resolution During Phase 1-2)

4. **Performance Baseline Values:**
   - **Question:** What are exact current render times for 100/1000/5000 files to establish regression thresholds?
   - **Impact:** Defines success criteria for Phase 4.2 performance validation
   - **Resolution Path:** Phase 1.3 will measure and document baseline performance
   - **Decision Maker:** Engineering team establishes acceptable variance thresholds
   - **Deadline:** End of Phase 1.3

5. **Test Coverage Baseline:**
   - **Question:** What is current test coverage percentage to ensure we maintain or exceed it?
   - **Impact:** Defines quality gate for all phases
   - **Resolution Path:** Phase 1.3 will measure and document baseline coverage
   - **Decision Maker:** QA + Engineering establish minimum coverage thresholds
   - **Deadline:** End of Phase 1.3

6. **MUI X Virtualization Trade-offs:**
   - **Question:** Does MUI X virtualization require changes to dynamic file addition patterns or double-click handlers? Any behavioral differences to document?
   - **Impact:** May affect Phase 2.2 (Files Plugin) implementation approach
   - **Resolution Path:** Phase 1.2 prototype will test virtualization with dynamic file operations
   - **Decision Maker:** Technical lead documents trade-offs and mitigation strategy
   - **Deadline:** End of Phase 1.2

### Low Priority (Can Be Resolved Post-Migration)

7. **Migration Strategy Granularity:**
   - **Question:** Should we migrate incrementally (feature-by-feature with feature flags) or do full replacement?
   - **Impact:** Affects rollout complexity in Phase 4.4
   - **Resolution Path:** Phase 1.4 rollout plan will specify strategy
   - **Current Assumption:** Full replacement with feature flag for old vs new component (simpler than feature-by-feature)
   - **Decision Maker:** Product + Engineering based on risk assessment
   - **Deadline:** End of Phase 1.4

8. **Bundle Size Impact:**
   - **Question:** What is exact bundle size delta when adding @mui/x-tree-view dependency? Is tree-shaking effective with our usage pattern?
   - **Impact:** May require bundle optimization if impact is significant
   - **Resolution Path:** Phase 2.1 will measure bundle impact during @mui/x-tree-view integration
   - **Current Assumption:** Minimal impact since @mui/material already loaded, MUI X shares dependencies
   - **Decision Maker:** Performance team reviews and approves bundle delta
   - **Deadline:** End of Phase 2.1

9. **Accessibility Gaps:**
   - **Question:** What specific WCAG 2.1 AA criteria does current implementation fail that MUI X addresses?
   - **Impact:** Helps quantify accessibility improvement benefit
   - **Resolution Path:** Run baseline accessibility audit during Phase 1.3, compare to post-migration audit in Phase 4.2
   - **Current Assumption:** MUI X provides better ARIA attributes and keyboard navigation out-of-box
   - **Decision Maker:** Accessibility team reviews audit findings
   - **Deadline:** Baseline by end of Phase 1.3, comparison by end of Phase 4.2

10. **FileExplorerBasic Migration:**
    - **Question:** Should FileExplorerBasic component follow same migration path or remain custom? Does it share enough code to benefit from this work?
    - **Impact:** Potential follow-up project scope
    - **Resolution Path:** Evaluate after core FileExplorer migration completes successfully
    - **Current Assumption:** Out of scope for this migration, evaluate separately after success proven
    - **Decision Maker:** Product team based on ROI analysis post-migration
    - **Deadline:** Post Phase 4 completion (follow-up project decision)

---

## 6. Appendices

### A. Risk Matrix

| Risk | Probability | Impact | Mitigation Status | Owner |
|------|-------------|--------|-------------------|-------|
| MUI X grid layout incompatibility | Medium | High | Phase 1.2 prototype validation | Tech Lead |
| DnD architecture conflict | Medium | High | Phase 1.2 prototype validation | Tech Lead |
| Performance regression >10% | Low | High | Phase 1.3 baseline + Phase 4.2 validation | Performance Team |
| sui-editor breaking changes | Low | Critical | Phase 4.1 integration testing | QA + Engineering |
| Plugin adapter complexity | Medium | Medium | Phase 1.4 architecture design | Tech Lead |
| Accessibility regression | Low | Medium | Phase 4.2 audit validation | Accessibility Team |
| Bundle size increase | Low | Low | Phase 2.1 measurement | Performance Team |

### B. Success Metrics Summary

| Metric | Baseline | Target | Validation Phase |
|--------|----------|--------|------------------|
| Core code lines | 686 lines | ≤400 lines (40%+ reduction) | Phase 4.3 |
| Test coverage | TBD in 1.3 | ≥baseline | All phases |
| Render time (1000 files) | TBD in 1.3 | ≤baseline + 10% | Phase 4.2 |
| Memory usage | TBD in 1.3 | ≤baseline + 10% | Phase 4.2 |
| Accessibility score | TBD in 1.3 | ≥95% | Phase 4.2 |
| sui-editor integration tests | 100% passing | 100% passing (no changes) | Phase 4.1 |
| Plugin functionality | 8 plugins working | 8 plugins working | Phases 2-3 |

### C. Dependencies

**External Package Dependencies:**
- `@mui/x-tree-view` - New dependency, version TBD (compatible with @mui/material v5.15.21+)
- `@mui/material` - Existing dependency v5.15.21+ (no change)
- `react` - Existing peer dependency v18.3.1 (no change)
- `typescript` - Existing dev dependency for type checking (no change)

**Internal Package Dependencies:**
- `@stoked-ui/file-explorer` - Package being migrated
- `@stoked-ui/editor` - Integration consumer (no changes allowed)
- `@stoked-ui/internal-test-utils` - Test infrastructure dependency

**Knowledge Dependencies:**
- [MUI X Tree View Documentation](https://mui.com/x/react-tree-view/)
- [MUI X RichTreeView Customization](https://mui.com/x/react-tree-view/rich-tree-view/customization/#file-explorer)
- [MUI X RichTreeView API Reference](https://mui.com/x/api/tree-view/rich-tree-view/)

### D. Timeline Estimate

**Total Estimated Duration:** 3-4 weeks (single developer) or 2-3 weeks (pair)

| Phase | Duration | Parallelizable | Dependencies |
|-------|----------|----------------|--------------|
| Phase 1: Foundation Analysis | 3-5 days | Work items 1.1-1.3 can run parallel, 1.4 depends on 1.1-1.3 | None |
| Phase 2: Core Migration | 5-7 days | Work items sequential (each plugin builds on previous) | Phase 1 complete |
| Phase 3: Advanced Features | 3-5 days | Work items 3.1 and 3.2 can run parallel | Phase 2 complete |
| Phase 4: Integration & Rollout | 5-7 days | Work items mostly sequential, monitoring setup parallel | Phase 3 complete |
| **Total** | **16-24 days** | - | - |

**Note:** Timeline assumes single developer working full-time. Pair programming could reduce by ~30%. Additional buffer recommended for unknown unknowns.

---

**Document Version:** 1.0
**Status:** Draft for Review
**Next Review Date:** Upon Phase 1 Completion
