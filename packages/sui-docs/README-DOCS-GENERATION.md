# Component Documentation Generation

This document explains how to generate and maintain comprehensive documentation for the components in the Sui packages.

## Documentation Structure

Each component should have comprehensive documentation that follows the MUI documentation style, including:

1. **Overview** - A clear explanation of what the component does and its purpose
2. **Examples** - Working examples showing different use cases and configurations
3. **API Reference** - Detailed description of props, methods, and CSS customization options

## Documentation Files Structure

For each component, the documentation should be organized as follows:

```
packages/[package-name]/docs/src/components/[ComponentName]/
├── [componentname].md          # Main documentation file
├── Basic[ComponentName].tsx    # Basic example component
├── Custom[ComponentName].tsx   # Additional example (optional)
├── Advanced[ComponentName].tsx # Additional example (optional)
└── index.ts                    # Exports all examples
```

## Generating Documentation

We provide scripts to help you generate and maintain documentation.

### 1. Generate Documentation for a Single Component

To generate documentation for a specific component in a package:

```bash
node packages/sui-docs/scripts/generate-component-docs.js [package-name] [ComponentName]
```

Example:
```bash
node packages/sui-docs/scripts/generate-component-docs.js sui-timeline Timeline
```

This will create the basic documentation structure for the Timeline component in the sui-timeline package.

### 2. Generate Documentation for All Components in a Package

To generate documentation for all components in a specific package:

```bash
node packages/sui-docs/scripts/generate-all-docs.js [package-name]
```

Example:
```bash
node packages/sui-docs/scripts/generate-all-docs.js sui-timeline
```

### 3. Generate Documentation for All Components in All Packages

To generate documentation for all components across all packages:

```bash
node packages/sui-docs/scripts/generate-all-docs.js
```

Use the `--force` flag to regenerate documentation even if it already exists:

```bash
node packages/sui-docs/scripts/generate-all-docs.js --force
```

### 4. Check Documentation Status

To check which components are missing documentation:

```bash
node packages/sui-docs/scripts/identify-components.js
```

This will generate a report of all components in the project and indicate which ones are missing documentation.

## Documentation Template

The generated documentation follows a standard template. You should customize the generated files to:

1. Add detailed descriptions of the component and its purpose
2. Create meaningful examples showing different use cases
3. Expand on the API reference to include all props and their usage
4. Add information about CSS customization options

## Writing Good Documentation

When documenting components, follow these best practices:

1. **Be comprehensive** - Document all props, methods, and customization options
2. **Include examples** - Provide examples for different use cases and configurations
3. **Keep it up-to-date** - Update documentation when the component changes
4. **Use clear language** - Be concise and clear in your explanations
5. **Add interactive examples** - Create examples that users can interact with
6. **Document edge cases** - Include information about edge cases and error handling

## Live Documentation

The documentation is designed to be integrated into a documentation site where the examples are interactive and users can see the components in action.

## Contributing to Documentation

When developing new components or modifying existing ones, be sure to update the documentation accordingly. Good documentation is essential for maintainability and usability of the components. 