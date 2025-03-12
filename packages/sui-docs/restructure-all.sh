#!/bin/bash

# Script to run all component restructuring steps

echo "=== Starting @stoked-ui/docs component restructuring ==="
echo ""

echo "Step 1: Restructuring components..."
node restructure-components.js
if [ $? -ne 0 ]; then
  echo "❌ Error during restructuring. Aborting."
  exit 1
fi
echo ""

echo "Step 2: Updating import paths..."
node update-imports.js
if [ $? -ne 0 ]; then
  echo "❌ Error updating imports. Aborting."
  exit 1
fi
echo ""

echo "Step 3: Adding file extensions to imports..."
node fix-extensions.js
if [ $? -ne 0 ]; then
  echo "❌ Error fixing extensions. Aborting."
  exit 1
fi
echo ""

echo "Step 4: Verifying components..."
node verify-components.js
# Don't exit on verification errors, just report them
echo ""

echo "=== Component restructuring complete! ==="
echo "Next steps:"
echo "1. Fix any issues reported by the verification"
echo "2. Run 'pnpm build' to build the package"
echo "3. Test imports to ensure everything works correctly"
echo ""

exit 0 
