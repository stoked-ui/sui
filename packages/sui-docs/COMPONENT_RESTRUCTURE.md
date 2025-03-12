# @stoked-ui/docs Component Restructuring

This document explains how to use the component restructuring script in the @stoked-ui/docs package for better organization and direct imports.

## Goal

The restructuring aims to:

1. Move all components into their own folders in the `components/` directory
2. Enable direct imports like `import Component from '@stoked-ui/docs/Component'`
3. Provide TypeScript declarations for better type safety
4. Maintain backward compatibility

## Running the Script

The script handles all the work in one go. Simply run:

```bash
# Navigate to the package directory
cd packages/sui-docs

# Run the restructuring script
pnpm restructure
```

Or use Node directly:

```bash
node restructure.js
```

## What the Script Does

This comprehensive script:

1. **Creates component directories** - Organizes components in their own folders
2. **Copies and creates files** - Moves component files and generates index files
3. **Updates import paths** - Fixes relative imports between components
4. **Adds file extensions** - Adds `.js` extensions to imports for ESM compatibility
5. **Updates package.json** - Adds exports for direct component imports
6. **Verifies the result** - Checks that everything is set up correctly

## After Running the Script

After the restructuring is complete:

1. Review any issues reported by the script's verification
2. Build the package: `pnpm build`
3. Test the direct imports in your applications

## Examples

### Direct Imports

After restructuring, consumers can import components directly:

```jsx
// Before
import { Link } from '@stoked-ui/docs';

// After
import Link from '@stoked-ui/docs/Link';
```

### Component Structure

Each component will have this structure:

```
components/
  ComponentName/
    index.ts              // Re-exports the component
    ComponentName.js      // Component implementation
    ComponentName.d.ts    // TypeScript declarations
```

## Troubleshooting

- **Missing exports**: Check the package.json exports field
- **Import errors**: Some import paths might need manual adjustment
- **Build errors**: Check TypeScript declarations for errors
- **Circular dependencies**: Resolve any circular dependencies between components
