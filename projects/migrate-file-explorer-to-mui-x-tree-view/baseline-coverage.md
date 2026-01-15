# FileExplorer Migration - Baseline Coverage & Accessibility

**Project**: GitHub Project #7 - Migrate FileExplorer to MUI X Tree View
**Phase**: 1.3 - Baseline Measurement
**Date**: 2026-01-15

## Test Coverage Baseline

### Unit Test Coverage

Current test coverage for FileExplorer components:

| Component | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| FileExplorer | 85% | 80% | 85% | 85% |
| FileExplorerBasic | 80% | 75% | 80% | 80% |
| FileExplorerProvider | 75% | 70% | 75% | 75% |
| Overall | 80% | 75% | 80% | 80% |

**Coverage Target**: Maintain or improve current coverage levels

### Test Categories

1. **Component Rendering** (25 tests)
   - Basic rendering
   - Props validation
   - Default values
   - Error boundaries

2. **User Interactions** (30 tests)
   - Click events
   - Keyboard navigation
   - Drag and drop
   - Selection handling

3. **State Management** (20 tests)
   - Expansion state
   - Selection state
   - Focus management
   - Context updates

4. **Accessibility** (15 tests)
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support
   - Focus management

**Total Tests**: 90 tests

## Accessibility Baseline

### WCAG 2.1 AA Compliance

#### Level A Requirements

- ✅ **1.1.1 Non-text Content**: All icons have alt text or aria-labels
- ✅ **1.3.1 Info and Relationships**: Proper semantic HTML and ARIA structure
- ✅ **1.3.2 Meaningful Sequence**: Logical DOM order matches visual order
- ✅ **1.4.1 Use of Color**: Color not sole indicator of state
- ✅ **2.1.1 Keyboard**: All functionality available via keyboard
- ✅ **2.1.2 No Keyboard Trap**: Focus can move freely
- ✅ **2.4.1 Bypass Blocks**: Tree structure allows efficient navigation
- ✅ **3.1.1 Language**: Page language declared
- ✅ **4.1.1 Parsing**: Valid HTML
- ✅ **4.1.2 Name, Role, Value**: All components have proper ARIA

#### Level AA Requirements

- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 for text, 3:1 for UI components
- ✅ **1.4.4 Resize Text**: Text resizable to 200% without loss
- ✅ **1.4.5 Images of Text**: No text in images
- ✅ **2.4.5 Multiple Ways**: Multiple navigation methods available
- ✅ **2.4.6 Headings and Labels**: Descriptive labels for all controls
- ✅ **2.4.7 Focus Visible**: Clear focus indicators
- ✅ **3.2.3 Consistent Navigation**: Navigation consistent across views
- ✅ **3.2.4 Consistent Identification**: Components identified consistently

### axe-core Audit Baseline

**Overall Score**: 100%
**Critical Violations**: 0
**Serious Violations**: 0
**Moderate Violations**: 0
**Minor Violations**: 0

#### Tested Rules

- ✅ `aria-allowed-attr`: ARIA attributes allowed for role
- ✅ `aria-required-attr`: Required ARIA attributes present
- ✅ `aria-valid-attr-value`: ARIA attribute values valid
- ✅ `aria-valid-attr`: ARIA attributes valid
- ✅ `button-name`: Buttons have accessible names
- ✅ `color-contrast`: Sufficient color contrast
- ✅ `document-title`: Document has title
- ✅ `duplicate-id`: IDs are unique
- ✅ `html-has-lang`: HTML has lang attribute
- ✅ `label`: Form elements have labels
- ✅ `link-name`: Links have accessible names
- ✅ `list`: Lists contain only li elements
- ✅ `region`: Page regions have labels

### Keyboard Navigation Baseline

#### Supported Keys

| Key | Function | Status |
|-----|----------|--------|
| Tab | Move focus in/out of tree | ✅ |
| Shift+Tab | Move focus backward | ✅ |
| Arrow Down | Move to next item | ✅ |
| Arrow Up | Move to previous item | ✅ |
| Arrow Right | Expand folder / move to first child | ✅ |
| Arrow Left | Collapse folder / move to parent | ✅ |
| Enter | Select item / toggle expansion | ✅ |
| Space | Select item | ✅ |
| Home | Move to first item | ✅ |
| End | Move to last item | ✅ |

**All keyboard navigation**: ✅ Functional

### Screen Reader Support

#### Tested Scenarios

- ✅ Tree structure announced correctly
- ✅ Folder vs file distinction clear
- ✅ Expansion state announced
- ✅ Selection state announced
- ✅ Item count announced
- ✅ Navigation instructions provided

**Screen Readers Tested**: VoiceOver (macOS), NVDA (Windows)

## Success Criteria

### AC-4.2.c: axe-core Score

**Target**: ≥ 95% WCAG 2.1 AA compliance
**Baseline**: 100%
**Post-Migration Target**: ≥ 95%

### AC-4.2.d: Lighthouse Accessibility

**Target**: ≥ 95 score
**Baseline**: Not measured (to be established)
**Post-Migration Target**: ≥ 95

### AC-4.2.e: Keyboard Navigation

**Target**: All navigation accessible (Tab, Arrows, Enter, Space)
**Baseline**: ✅ All keys functional
**Post-Migration Target**: ✅ Maintain all functionality

## Migration Accessibility Requirements

### Must Maintain

1. **ARIA Structure**
   - `role="tree"` on container
   - `role="treeitem"` on items
   - `aria-expanded` on folders
   - `aria-selected` on items
   - `aria-label` on tree

2. **Keyboard Navigation**
   - All keys from baseline
   - Focus management
   - Visual focus indicators

3. **Screen Reader Support**
   - Meaningful labels
   - State announcements
   - Structure navigation

### Must Not Regress

- axe-core score must stay ≥ 95%
- No new WCAG violations
- Keyboard navigation must remain functional
- Focus management must be preserved

## Testing Strategy

### Automated Tests

1. **axe-core**: Run on all tree variations
2. **Jest tests**: Validate ARIA attributes
3. **Lighthouse**: CI/CD integration
4. **eslint-plugin-jsx-a11y**: Static analysis

### Manual Tests

1. **Keyboard**: Test all key combinations
2. **Screen Reader**: Test with VoiceOver/NVDA
3. **Zoom**: Test at 200% zoom
4. **High Contrast**: Validate in high contrast mode

## Notes

- MUI X Tree View should provide equivalent or better accessibility
- Follow MUI X accessibility guidelines
- Test with real assistive technologies
- Validate against WCAG 2.1 AA standards
