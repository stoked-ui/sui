## v0.1.4 (Unreleased)

### Breaking Changes
- Removed dependency on react-virtualized, replacing it with custom interfaces
- All components now use react-window's VariableSizeList and VariableSizeGrid instead of react-virtualized components
- Converted package to use ESM by default with `"type": "module"` in package.json

### Code Improvements
- Created custom OnScrollParams interface to eliminate dependency on react-virtualized types
- Removed unused ScrollSync references
- Removed @types/react-virtualized from package.json dependencies 
- Added proper ESM/CJS dual package support via package.json "exports" field
- Added better tree-shaking support through proper sideEffects configuration
- Updated TypeScript configuration with moduleResolution "bundler" for modern bundler compatibility
- Added babel configuration for better transpilation control
- Added browserslist configuration for targeted browser support

### Developer Experience
- Package now properly supports both modern bundlers (webpack, rollup, vite) and older build systems
- Import statements work without file extensions through proper TypeScript configuration
- Tree-shaking is fully supported in modern bundlers
