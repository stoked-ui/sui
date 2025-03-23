# Changelog

## Unreleased

### Added
- Created comprehensive example in documentation that demonstrates:
  - File and folder selection
  - Details panel for selected items
  - File operation actions (download, edit, delete)
  - Formatting for file size and dates
- Added AccessibleFileExplorer example with keyboard navigation:
  - Tab navigation between items
  - Keyboard shortcuts (Enter, Arrow keys)
  - ARIA attributes for screen readers
  - Visual feedback for actions
- Updated BasicFileExplorer example with better visualization and proper typing
- Expanded documentation with sections for:
  - Props API with detailed descriptions
  - Item Types with interface definitions
  - Styling guide with examples
  - Best practices for implementation
  - Common use cases
  - Accessibility guidelines
  - Mobile responsiveness considerations
- Added test file for FileExplorerBasic component
- Created detailed README with installation and usage instructions
- Added MediaTypeEnum for easier type handling

### Changed
- Updated documentation structure for better readability
- Enhanced example code with proper TypeScript types
- Improved file organization in documentation
- Fixed Material-UI Grid component usage for better responsiveness
- Updated formatFileSize function to use template literals

### Fixed
- TypeScript typing issues in example components
- Import paths for package components
- Date vs. number type mismatch for lastModified property
- If statement formatting in components
- Fragment usage (using React.Fragment instead of <> syntax)
- Improved variable naming to avoid shadowing
