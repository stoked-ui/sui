# sui-file-explorer TODO List

## Configuration Issues

### Webpack/ESM Import Errors
- **Problem**: Multiple "webpack with invalid interface loaded as resolver" errors throughout the codebase
- **Description**: These appear to be related to the webpack configuration and how the module resolution is set up
- **Resolution**: May require adjusting webpack configuration or TypeScript settings in tsconfig.json

### Missing File Extensions
- **Problem**: "Missing file extension for X" errors in import statements
- **Description**: ESM imports require file extensions, but the current imports don't include them
- **Resolution**: Either configure the bundler to handle imports without extensions or update all import statements to include extensions

## TypeScript Type Compatibility Issues

### MediaType Module
- **Problem**: Cannot find module '@stoked-ui/media-selector' or its corresponding type declarations
- **Description**: The MediaType imports from media-selector are failing
- **Resolution**: Ensure that the media-selector package is properly linked and its types are accessible, or update the MediaTypeEnum to be self-contained

### Component Props Type Errors
- **Problem**: Type compatibility issues with the FileExplorer and FileExplorerBasic components
- **Description**: Properties like 'items', 'onExpandItem', etc. don't match the component interfaces
- **Resolution**: Update the component interfaces to include these properties or adjust the examples to match the existing interfaces

### Material-UI Grid Component Errors
- **Problem**: Type errors with Material-UI Grid component props
- **Description**: Issues with 'xs', 'md', and other responsive props on Grid components
- **Resolution**: Update to use the correct prop API for the specific MUI version, or use alternative styling approaches

## Code Quality Issues

### Loop Usage
- **Problem**: "iterators/generators require regenerator-runtime" warning for for-loops
- **Description**: ESLint is configured to prefer array methods over loops
- **Resolution**: Replace for loops with array methods like .find(), .map(), .filter(), etc.

### Conditional Statement Formatting
- **Problem**: "Expected { after 'if' condition" errors
- **Description**: Code style preference for using braces with all if statements
- **Resolution**: Add braces to all if statements, even one-liners

### Unused Variable Warnings
- **Problem**: 'setItems' is assigned a value but never used
- **Description**: State setter is defined but not used anywhere
- **Resolution**: Either use the setter or remove it if not needed

### Math.pow Usage
- **Problem**: 'Use the '**' operator instead of 'Math.pow''
- **Description**: ESLint prefers the newer exponentiation operator
- **Resolution**: Replace `Math.pow(k, i)` with `k ** i`

## Testing Issues

### Missing Test Utils
- **Problem**: Cannot find module '@stoked-ui/internal-test-utils'
- **Description**: Test utilities appear to be missing or not properly linked
- **Resolution**: Ensure the test utilities package is available or create an alternative approach for rendering components in tests

### Test Assertion Format
- **Problem**: "Expected an assignment or function call and instead saw an expression"
- **Description**: Issues with how chai assertions are being used
- **Resolution**: Ensure proper format for chai assertions (may need to adjust ESLint config to recognize chai assertions)

## Documentation

- Review all examples to ensure they match the current API
- Add more information about keyboard navigation and accessibility
- Document the relationship between MediaType and MediaTypeEnum
- Add type definitions for all callback function parameters 
