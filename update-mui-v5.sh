#!/bin/bash

# This script updates all MUI packages to their latest v5 versions

# Define the latest v5 versions
MUI_MATERIAL="5.17.1"
MUI_SYSTEM="5.17.1"
MUI_UTILS="5.17.1" 
MUI_STYLES="5.17.1"
MUI_BASE="5.0.0-beta.70"
MUI_ICONS_MATERIAL="5.15.21"
MUI_JOY="5.0.0-beta.52"
MUI_LAB="5.0.0-alpha.176"
MUI_X_DATA_GRID="6.20.4"  # Latest version compatible with MUI v5
MUI_X_DATE_PICKERS="6.19.7"  # Latest version compatible with MUI v5
MUI_X_TREE_VIEW="6.17.0"  # Latest version compatible with MUI v5
MUI_MATERIAL_NEXTJS="5.16.6"

# Update root package.json
echo "Updating root package.json..."
sed -i '' 's/"@mui\/material": "\^6[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' package.json
sed -i '' 's/"@mui\/utils": "\^6[^"]*"/"@mui\/utils": "^'"$MUI_UTILS"'"/g' package.json

# Update packages/sui-docs/package.json
echo "Updating packages/sui-docs/package.json..."
sed -i '' 's/"@mui\/icons-material": "\^6[^"]*"/"@mui\/icons-material": "^'"$MUI_ICONS_MATERIAL"'"/g' packages/sui-docs/package.json
sed -i '' 's/"@mui\/material": "\^6[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' packages/sui-docs/package.json
sed -i '' 's/"@mui\/system": "\^6[^"]*"/"@mui\/system": "^'"$MUI_SYSTEM"'"/g' packages/sui-docs/package.json
sed -i '' 's/"@mui\/base": "\*"/"@mui\/base": "^'"$MUI_BASE"'"/g' packages/sui-docs/package.json

# Update packages/sui-file-explorer/package.json
echo "Updating packages/sui-file-explorer/package.json..."
sed -i '' 's/"@mui\/base": "\^5[^"]*"/"@mui\/base": "^'"$MUI_BASE"'"/g' packages/sui-file-explorer/package.json
sed -i '' 's/"@mui\/system": "\^5[^"]*"/"@mui\/system": "^'"$MUI_SYSTEM"'"/g' packages/sui-file-explorer/package.json
sed -i '' 's/"@mui\/utils": "\^5[^"]*"/"@mui\/utils": "^'"$MUI_UTILS"'"/g' packages/sui-file-explorer/package.json
sed -i '' 's/"@mui\/icons-material": "\^5[^"]*"/"@mui\/icons-material": "^'"$MUI_ICONS_MATERIAL"'"/g' packages/sui-file-explorer/package.json
sed -i '' 's/"@mui\/material": "\^5[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' packages/sui-file-explorer/package.json

# Update packages/sui-timeline/package.json
echo "Updating packages/sui-timeline/package.json..."
sed -i '' 's/"@mui\/system": "\^5"/"@mui\/system": "^'"$MUI_SYSTEM"'"/g' packages/sui-timeline/package.json
sed -i '' 's/"@mui\/icons-material": "\^5[^"]*"/"@mui\/icons-material": "^'"$MUI_ICONS_MATERIAL"'"/g' packages/sui-timeline/package.json

# Update packages/sui-common/package.json
echo "Updating packages/sui-common/package.json..."
sed -i '' 's/"@mui\/icons-material": "\^5[^"]*"/"@mui\/icons-material": "^'"$MUI_ICONS_MATERIAL"'"/g' packages/sui-common/package.json
sed -i '' 's/"@mui\/material": "\^5[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' packages/sui-common/package.json

# Update packages/sui-editor/package.json
echo "Updating packages/sui-editor/package.json..."
sed -i '' 's/"@mui\/base": "\^5[^"]*"/"@mui\/base": "^'"$MUI_BASE"'"/g' packages/sui-editor/package.json
sed -i '' 's/"@mui\/system": "\^5[^"]*"/"@mui\/system": "^'"$MUI_SYSTEM"'"/g' packages/sui-editor/package.json
sed -i '' 's/"@mui\/utils": "\^5[^"]*"/"@mui\/utils": "^'"$MUI_UTILS"'"/g' packages/sui-editor/package.json
sed -i '' 's/"@mui\/icons-material": "\^5[^"]*"/"@mui\/icons-material": "^'"$MUI_ICONS_MATERIAL"'"/g' packages/sui-editor/package.json
sed -i '' 's/"@mui\/material": "\^5[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' packages/sui-editor/package.json

# Update packages/sui-github/package.json
echo "Updating packages/sui-github/package.json..."
sed -i '' 's/"@mui\/base": "\^5[^"]*"/"@mui\/base": "^'"$MUI_BASE"'"/g' packages/sui-github/package.json
sed -i '' 's/"@mui\/icons-material": "\^5[^"]*"/"@mui\/icons-material": "^'"$MUI_ICONS_MATERIAL"'"/g' packages/sui-github/package.json
sed -i '' 's/"@mui\/material": "\^5[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' packages/sui-github/package.json

# Update docs/package.json
echo "Updating docs/package.json..."
sed -i '' 's/"@mui\/base": "\^5[^"]*"/"@mui\/base": "^'"$MUI_BASE"'"/g' docs/package.json
sed -i '' 's/"@mui\/icons-material": "5[^"]*"/"@mui\/icons-material": "'"$MUI_ICONS_MATERIAL"'"/g' docs/package.json
sed -i '' 's/"@mui\/lab": "\^5[^"]*"/"@mui\/lab": "^'"$MUI_LAB"'"/g' docs/package.json
sed -i '' 's/"@mui\/material": "\^5[^"]*"/"@mui\/material": "^'"$MUI_MATERIAL"'"/g' docs/package.json
sed -i '' 's/"@mui\/material-nextjs": "\^5[^"]*"/"@mui\/material-nextjs": "^'"$MUI_MATERIAL_NEXTJS"'"/g' docs/package.json
sed -i '' 's/"@mui\/styles": "\^5[^"]*"/"@mui\/styles": "^'"$MUI_STYLES"'"/g' docs/package.json
sed -i '' 's/"@mui\/system": "\^5[^"]*"/"@mui\/system": "^'"$MUI_SYSTEM"'"/g' docs/package.json
sed -i '' 's/"@mui\/utils": "\^5[^"]*"/"@mui\/utils": "^'"$MUI_UTILS"'"/g' docs/package.json
sed -i '' 's/"@mui\/x-data-grid": "7[^"]*"/"@mui\/x-data-grid": "'"$MUI_X_DATA_GRID"'"/g' docs/package.json
sed -i '' 's/"@mui\/x-date-pickers": "6[^"]*"/"@mui\/x-date-pickers": "'"$MUI_X_DATE_PICKERS"'"/g' docs/package.json
sed -i '' 's/"@mui\/x-tree-view": "6[^"]*"/"@mui\/x-tree-view": "'"$MUI_X_TREE_VIEW"'"/g' docs/package.json

echo "MUI packages updated to v5 versions" 
