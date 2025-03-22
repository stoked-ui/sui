#!/bin/bash

# Generate documentation for all components
# This script is a wrapper around the documentation generation tools in packages/sui-docs

echo "=== Stoked UI Documentation Generator ==="
echo "This tool will help you generate documentation for all components in the Sui packages."
echo ""

# Check if argument is provided
if [ "$1" == "--force" ]; then
  FORCE_ARG="--force"
  echo "Force mode enabled: Will regenerate documentation even if it already exists."
elif [ "$1" != "" ]; then
  PACKAGE_NAME="$1"
  if [ "$2" == "--force" ]; then
    FORCE_ARG="--force"
    echo "Force mode enabled: Will regenerate documentation even if it already exists."
  fi
  echo "Generating documentation for package: $PACKAGE_NAME"
else
  echo "No specific package provided. Will operate on all packages."
fi

# Make sure the scripts directory exists
mkdir -p packages/sui-docs/scripts
mkdir -p packages/sui-docs/templates

# Make sure the templates directory exists
if [ ! -f "packages/sui-docs/templates/component-doc-template.md" ]; then
  echo "Template file not found. Please make sure the templates directory is set up properly."
  exit 1
fi

# Run the documentation identification script
echo ""
echo "Step 1: Identifying components that need documentation..."
node packages/sui-docs/scripts/identify-components.js

# Run the documentation generation script
echo ""
echo "Step 2: Generating documentation..."

if [ "$PACKAGE_NAME" != "" ]; then
  node packages/sui-docs/scripts/generate-all-docs.js "$PACKAGE_NAME" $FORCE_ARG
else
  node packages/sui-docs/scripts/generate-all-docs.js $FORCE_ARG
fi

echo ""
echo "Documentation generation complete!"
echo "Please manually review and enhance the generated documentation."
echo "See packages/sui-docs/README-DOCS-GENERATION.md for best practices on writing good documentation." 