# Migration Tooling Documentation

## Overview

The `@stoked-ui/media` package includes automated migration tools to help developers transition from the deprecated `@stoked-ui/media-selector` package.

## Migration Tools Included

The package provides three main CLI commands:

1. **migrate** - Automated migration script
2. **validate-migration** - Validation and verification tool
3. **rollback** - Rollback capability

## Tool Descriptions

### 1. Migration Tool (`migrate.js`)

**Purpose:** Automatically migrate your codebase from `@stoked-ui/media-selector` to `@stoked-ui/media`.

**Features:**
- Scans project for all TypeScript/JavaScript files
- Updates import statements automatically
- Handles named, default, and type imports
- Updates package.json dependencies
- Creates automatic backup before modifications
- Provides detailed migration report
- Dry-run mode for preview

**File Size:** ~21KB

**Dependencies:** Node.js built-in modules only

**Usage:**

```bash
# Preview changes (no modifications)
npx @stoked-ui/media migrate --dry-run

# Perform actual migration
npx @stoked-ui/media migrate

# Migrate specific directory
npx @stoked-ui/media migrate --path ./packages/my-app

# Verbose output for debugging
npx @stoked-ui/media migrate --verbose

# Combined options
npx @stoked-ui/media migrate --dry-run --path ./src --verbose
```

**What It Does:**

1. **File Discovery**
   - Recursively scans project for `.ts`, `.tsx`, `.js`, `.jsx` files
   - Skips common directories: node_modules, .git, dist, build, etc.
   - Reports total files analyzed

2. **Import Analysis**
   - Identifies all imports from deprecated package
   - Analyzes import type (named, default, type, subpath)
   - Tracks import details for reporting

3. **Backup Creation**
   - Creates timestamped backup directory
   - Preserves original file structure
   - Backs up package.json

4. **Transformation**
   - Updates all import paths
   - Converts subpath imports to main exports
   - Preserves import aliases and formatting

5. **Package.json Update**
   - Moves package from dependencies to dependencies in new package
   - Updates devDependencies if used there
   - Maintains version information

6. **Validation**
   - Checks for breaking changes
   - Verifies API compatibility
   - Reports potential issues

7. **Report Generation**
   - Shows migration summary
   - Lists all modified files
   - Reports any errors
   - Suggests next steps

**Example Output:**

```
[10:23:45] INFO   Starting migration from @stoked-ui/media-selector to @stoked-ui/media
[10:23:45] INFO   Scanning for source files...
[10:23:46] SUCCESS Found 42 source files
[10:23:46] INFO   Creating backup...
[10:23:46] SUCCESS Backup created: .migration-backup-1706000626000
[10:23:46] INFO   Processing files...
[10:23:47] SUCCESS Updated 28 files (58 imports)

╔════════════════════════════════════════════════════════════════╗
║         Migration Report: media-selector to media              ║
╚════════════════════════════════════════════════════════════════╝

⏱️  Duration: 1.23s

📊 Summary:
  • Files analyzed: 42
  • Files modified: 28
  • Imports updated: 58
  • package.json updated: Yes

📝 Modified Files:
  ✓ src/components/MediaUpload.tsx (3 imports)
  ✓ src/hooks/useMediaHandler.ts (2 imports)
  ...

✅ Migration complete!
```

### 2. Validation Tool (`validate-migration.js`)

**Purpose:** Verify that migration has been completed successfully and detect potential issues.

**Features:**
- Checks for remaining deprecated imports
- Validates package.json consistency
- Verifies new package is installed
- Detects API compatibility issues
- Checks TypeScript configuration
- Reports breaking changes

**File Size:** ~12KB

**Dependencies:** Node.js built-in modules only

**Usage:**

```bash
# Validate current directory
npx @stoked-ui/media validate-migration

# Validate specific directory
npx @stoked-ui/media validate-migration --path ./packages/my-app
```

**Validation Checks:**

1. **Deprecated Package Check**
   - Scans all source files for deprecated imports
   - Reports any remaining references
   - Shows file locations and counts

2. **Package.json Validation**
   - Checks dependencies section
   - Checks devDependencies section
   - Checks peerDependencies section
   - Verifies new package is present

3. **Import Consistency**
   - Counts imports from new package
   - Verifies import statements are valid
   - Reports inconsistencies

4. **API Compatibility**
   - Checks for common API usage patterns
   - Verifies compatibility with new package
   - Warns about breaking changes

5. **Breaking Changes Check**
   - Scans for deprecated patterns
   - Detects subpath import issues
   - Reports potential compatibility issues

6. **TypeScript Configuration**
   - Checks for tsconfig.json
   - Verifies build configuration
   - Warns about missing configs

**Example Output:**

```
╔════════════════════════════════════════════════════════════════╗
║      Validation Report: Media Selector Migration              ║
╚════════════════════════════════════════════════════════════════╝

✅ Passed (6):
  ✓ No imports from deprecated package found
  ✓ New package found in dependencies: @stoked-ui/media
  ✓ 28 imports from new package found
  ✓ FileWithPath API usage detected in migrated code
  ✓ MediaFile API usage detected in migrated code
  ✓ TypeScript configuration found

═══════════════════════════════════════════════════════════════════
✅ Migration validation PASSED
═══════════════════════════════════════════════════════════════════
```

### 3. Rollback Tool (`rollback.js`)

**Purpose:** Revert migration changes if needed.

**Features:**
- Finds and lists available backups
- Interactive confirmation prompts
- Restores from backup or git
- Detailed rollback report
- Git integration

**File Size:** ~10.5KB

**Dependencies:** Node.js built-in modules (+ readline for interactive mode)

**Usage:**

```bash
# Start interactive rollback
npx @stoked-ui/media rollback

# Rollback specific directory
npx @stoked-ui/media rollback --path ./packages/my-app
```

**Rollback Process:**

1. **Backup Detection**
   - Scans for `.migration-backup-*` directories
   - Lists available backups with timestamps
   - Shows creation dates

2. **User Confirmation**
   - Interactive prompts for confirmation
   - Shows which backup will be used
   - Allows cancellation

3. **Restoration**
   - Restores files from backup
   - Restores package.json
   - Maintains directory structure

4. **Report Generation**
   - Shows rollback status
   - Confirms successful restoration
   - Suggests next steps

**Example Output:**

```
Rollback utility for @stoked-ui/media-selector to @stoked-ui/media migration
Target path: /home/user/my-app

Available backups:

1. 2024-01-21 10:23:47 UTC
   Path: .migration-backup-1706000627000

Proceed with git rollback? (y/n): y

╔════════════════════════════════════════════════════════════════╗
║          Rollback Report: Media Selector Migration            ║
╚════════════════════════════════════════════════════════════════╝

⏱️  Duration: 0.45s
Method: Backup Restore

✅ Rollback SUCCESSFUL
Successfully restored from backup: .migration-backup-1706000627000

Next steps:
  1. Verify your files have been restored
  2. Review any uncommitted changes
  3. If using git, ensure your working tree is clean
  4. Reinstall dependencies if needed
```

## CLI Entry Point (`cli.js`)

**Purpose:** Provides a user-friendly command-line interface for all migration tools.

**Features:**
- Help text and documentation
- Version information
- Command routing
- Error handling
- Interactive feedback

**Usage:**

```bash
# Show help
npx @stoked-ui/media help

# Show version
npx @stoked-ui/media version

# Run commands
npx @stoked-ui/media migrate
npx @stoked-ui/media validate-migration
npx @stoked-ui/media rollback
```

## Technical Details

### Import Pattern Handling

The migration tool handles several import patterns:

**Named Imports:**
```javascript
// Before
import { MediaFile, WebFile } from '@stoked-ui/media-selector';

// After
import { MediaFile, WebFile } from '@stoked-ui/media';
```

**Default Imports:**
```javascript
// Before
import MediaFile from '@stoked-ui/media-selector/MediaFile';

// After
import { MediaFile } from '@stoked-ui/media';
```

**Type Imports:**
```typescript
// Before
import type { IMediaFile } from '@stoked-ui/media-selector';

// After
import type { IMediaFile } from '@stoked-ui/media';
```

**Subpath Imports:**
```javascript
// Before
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';

// After
import { FileWithPath } from '@stoked-ui/media';
```

### File System Handling

**Scanned Extensions:**
- `.ts` - TypeScript
- `.tsx` - TypeScript React
- `.js` - JavaScript
- `.jsx` - JavaScript React

**Excluded Directories:**
- node_modules
- .git
- dist
- build
- coverage
- .turbo
- .next
- out
- .vscode
- .idea
- .migration-backup-*

### Backup Management

Backups are created with timestamp-based naming:
```
.migration-backup-1706000627000/
├── package.json
├── src/
│   ├── components/
│   │   └── MediaUpload.tsx
│   ├── hooks/
│   │   └── useMediaHandler.ts
│   └── ...
└── ...
```

Each backup is self-contained and can be restored independently.

### Error Handling

All tools implement robust error handling:

**Migration Tool:**
- Catches file read/write errors
- Handles permission issues
- Validates file access
- Reports specific errors

**Validation Tool:**
- Gracefully handles missing files
- Skips inaccessible directories
- Reports all issues found
- Provides detailed context

**Rollback Tool:**
- Validates backup integrity
- Confirms git availability
- Interactive error recovery
- Clear error messages

## Package Configuration

### Binary Entry Point

The `package.json` includes:

```json
{
  "bin": {
    "sui-media": "scripts/cli.js"
  },
  "files": [
    "build",
    "scripts"
  ]
}
```

This enables:
- Global installation: `npm install -g @stoked-ui/media`
- npx usage: `npx @stoked-ui/media migrate`
- Direct execution: `sui-media migrate`

### Published Files

When published to npm, the package includes:
- `build/` - Compiled JavaScript library
- `scripts/` - Migration tooling

This ensures tools are available to users of the package.

## Performance Characteristics

### Migration Tool Performance

- **File scanning:** ~10-50ms per 1000 files
- **Import analysis:** ~5ms per file
- **Backup creation:** ~50-200ms depending on total size
- **File transformation:** ~1-10ms per file
- **Overall:** Typically 1-3 seconds for 100+ files

### Validation Tool Performance

- **File scanning:** ~10-50ms per 1000 files
- **Validation checks:** ~2-5ms per file
- **Overall:** Typically 0.5-2 seconds for 100+ files

### Rollback Performance

- **Backup listing:** ~5-20ms
- **File restoration:** ~50-200ms depending on backup size
- **Overall:** Typically 0.2-1 second

## Security Considerations

1. **Backup Creation**
   - Backups are created with current user permissions
   - Timestamped names prevent overwrites
   - Contained within project directory

2. **File Modifications**
   - No external network access
   - No code execution (parsing only)
   - Preserves file permissions
   - Creates backups before changes

3. **Git Integration**
   - Only used if explicitly requested
   - Requires user confirmation
   - Uses standard git commands
   - No force operations

## Testing the Tools

### Test Scenario 1: Dry-Run Mode

```bash
npx @stoked-ui/media migrate --dry-run
# Verify output matches expected changes
# Check no files were modified
# Confirm package.json wasn't changed
```

### Test Scenario 2: Full Migration

```bash
npx @stoked-ui/media migrate
npx @stoked-ui/media validate-migration
npm test
npm run build
```

### Test Scenario 3: Rollback

```bash
npx @stoked-ui/media rollback
# Verify files are restored
npm install
npm test
```

## Troubleshooting

### Common Issues

**Issue: "Cannot find module 'migrate'"**
- Solution: Ensure scripts are in the published package
- Check `npm list @stoked-ui/media`

**Issue: "Permission denied"**
- Solution: Ensure read/write permissions on target directory
- Try running with appropriate permissions

**Issue: "No backups found"**
- Solution: Check for `.migration-backup-*` directories
- Rollback may require git integration

**Issue: "Git revert failed"**
- Solution: Ensure git repository is clean
- Check for merge conflicts
- Use manual rollback from backup

## Future Enhancements

Potential improvements for future versions:

1. **Configuration Files**
   - `.migrationrc` for custom settings
   - Exclude patterns
   - Custom transformations

2. **Advanced Features**
   - Monorepo support
   - Multiple workspace migration
   - Custom hooks/plugins

3. **Integration**
   - CI/CD pipeline integration
   - GitHub Actions support
   - Automated validation

4. **Reporting**
   - HTML reports
   - JSON export
   - Custom formatters

## Contributing

To contribute improvements to the migration tools:

1. Edit the tool scripts in `scripts/`
2. Test thoroughly with various codebases
3. Update documentation
4. Submit pull request

## Support

For issues or questions about migration tools:

1. Check MIGRATION.md for guidance
2. Review tool output carefully
3. Search GitHub issues
4. Create detailed issue report

---

**Last Updated:** January 2026
**Tools Version:** 1.0.0
**Tested with:** Node.js 18+
