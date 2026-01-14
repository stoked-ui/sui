# Installation Guide

Complete installation and setup instructions for @stoked-ui/video-validator.

## Prerequisites

### System Requirements

- **Node.js**: >= 18.0.0
- **FFmpeg**: Latest stable version
- **Operating System**: macOS, Linux, or Windows

### Installing FFmpeg

FFmpeg is required for video processing and frame extraction.

#### macOS

```bash
# Using Homebrew (recommended)
brew install ffmpeg

# Verify installation
ffmpeg -version
```

#### Ubuntu/Debian

```bash
# Update package list
sudo apt-get update

# Install FFmpeg
sudo apt-get install -y ffmpeg

# Verify installation
ffmpeg -version
```

#### Windows

**Option 1: Chocolatey (recommended)**

```powershell
# Install Chocolatey if not already installed
# https://chocolatey.org/install

# Install FFmpeg
choco install ffmpeg

# Verify installation
ffmpeg -version
```

**Option 2: Manual Installation**

1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to a directory (e.g., `C:\ffmpeg`)
3. Add `C:\ffmpeg\bin` to system PATH
4. Restart terminal and verify: `ffmpeg -version`

#### Alpine Linux (Docker)

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Install your app
COPY . /app
WORKDIR /app
RUN npm install
```

## Package Installation

### Using pnpm (Recommended for Stoked UI projects)

```bash
# Install from npm registry
pnpm add @stoked-ui/video-validator

# Or install locally in monorepo
cd packages/sui-video-validator
pnpm install
pnpm build
```

### Using npm

```bash
npm install @stoked-ui/video-validator
```

### Using yarn

```bash
yarn add @stoked-ui/video-validator
```

## Development Setup

For contributors and developers working on the validator itself:

### 1. Clone Repository

```bash
# Clone Stoked UI monorepo
git clone https://github.com/stoked-ui/sui.git
cd sui

# Navigate to video-validator package
cd packages/sui-video-validator
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Or use npm
npm install
```

### 3. Build Package

```bash
# Build TypeScript to JavaScript
pnpm build

# Or for development with watch mode
pnpm dev
```

### 4. Run Tests

```bash
# Run integration tests (requires test video files)
pnpm test
```

## Verifying Installation

### CLI Verification

```bash
# Check if CLI is accessible
npx video-validator --version

# Or if installed globally
video-validator --version
```

### Programmatic Verification

Create a test file `test-install.js`:

```javascript
const { VideoValidator } = require('@stoked-ui/video-validator');

console.log('VideoValidator loaded successfully!');
console.log('Available methods:', Object.getOwnPropertyNames(VideoValidator.prototype));
```

Run it:

```bash
node test-install.js
```

### FFmpeg Integration Test

```bash
# Test FFmpeg integration
npx video-validator validate --help

# Should display help without errors
```

## Common Installation Issues

### Issue 1: FFmpeg Not Found

**Symptoms:**
```
Error: spawn ffmpeg ENOENT
```

**Solution:**

1. Verify FFmpeg is installed:
   ```bash
   ffmpeg -version
   ```

2. If not found, install FFmpeg (see above)

3. Verify FFmpeg is in PATH:
   ```bash
   # macOS/Linux
   which ffmpeg

   # Windows
   where ffmpeg
   ```

4. If installed but not in PATH, add FFmpeg directory to PATH

### Issue 2: Module Not Found

**Symptoms:**
```
Error: Cannot find module '@stoked-ui/video-validator'
```

**Solution:**

1. Ensure package is installed:
   ```bash
   pnpm list @stoked-ui/video-validator
   ```

2. Reinstall if needed:
   ```bash
   pnpm install @stoked-ui/video-validator
   ```

3. Verify package.json includes the dependency

### Issue 3: TypeScript Errors

**Symptoms:**
```
Cannot find type definitions for '@stoked-ui/video-validator'
```

**Solution:**

1. Ensure TypeScript is installed:
   ```bash
   npm install -D typescript
   ```

2. The package includes built-in type definitions (no @types package needed)

3. Verify tsconfig.json has proper module resolution:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

### Issue 4: Build Failures

**Symptoms:**
```
Build failed with errors
```

**Solution:**

1. Clean build artifacts:
   ```bash
   rm -rf dist node_modules
   pnpm install
   pnpm build
   ```

2. Ensure Node.js version is >= 18:
   ```bash
   node --version
   ```

3. Check for peer dependency warnings and resolve them

### Issue 5: Permission Errors (macOS/Linux)

**Symptoms:**
```
EACCES: permission denied
```

**Solution:**

1. Don't use `sudo` with npm/pnpm (avoid permission issues)

2. Fix npm permissions:
   ```bash
   # macOS/Linux
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   ```

3. Or use nvm to manage Node.js versions

### Issue 6: Sharp Installation Errors

**Symptoms:**
```
Error installing sharp
```

**Solution:**

1. Install build tools:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential

   # macOS (Xcode Command Line Tools)
   xcode-select --install
   ```

2. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   pnpm install
   ```

## Docker Setup

### Dockerfile Example

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Install build dependencies for sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build TypeScript
RUN pnpm build

# Run tests (optional)
RUN pnpm test || true

CMD ["node", "bin/cli.js"]
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  video-validator:
    build: .
    volumes:
      - ./test-videos:/videos
      - ./validation-output:/output
    command: >
      node bin/cli.js validate
      --reference /videos/reference.mp4
      --output /videos/rendered.mp4
      --output-dir /output
      --verbose
```

## CI/CD Environment Setup

### GitHub Actions

```yaml
- name: Setup FFmpeg
  run: |
    sudo apt-get update
    sudo apt-get install -y ffmpeg

- name: Install Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run validation
  run: pnpm video-validator validate ...
```

### GitLab CI

```yaml
variables:
  FF_USE_FASTZIP: "true"

before_script:
  - apk add --no-cache ffmpeg
  - npm install -g pnpm
  - pnpm install --frozen-lockfile

test:
  script:
    - pnpm video-validator validate ...
```

### Jenkins

```groovy
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'apt-get update && apt-get install -y ffmpeg'
                sh 'npm install -g pnpm'
                sh 'pnpm install'
            }
        }

        stage('Validate') {
            steps {
                sh 'pnpm video-validator validate ...'
            }
        }
    }
}
```

## Post-Installation

### 1. Test Installation

```bash
# Run a simple validation test
video-validator validate \
  --reference path/to/reference.mp4 \
  --output path/to/output.mp4 \
  --verbose
```

### 2. Configure Your Project

Create a `validation-config.json`:

```json
{
  "validations": [
    {
      "name": "Test Video",
      "reference": "./tests/fixtures/reference.mp4",
      "output": "./tests/output/rendered.mp4"
    }
  ],
  "config": {
    "frameCount": 8,
    "passThreshold": 0.9
  }
}
```

### 3. Integrate into Workflow

Add to your package.json:

```json
{
  "scripts": {
    "validate:videos": "video-validator batch --config validation-config.json",
    "test:render": "npm run render && npm run validate:videos"
  }
}
```

## Next Steps

1. Read the [Quick Start Guide](./QUICK_START.md)
2. Review [Usage Examples](./examples/usage-example.ts)
3. Check [Full Documentation](./README.md)
4. Explore [Contributing Guide](./CONTRIBUTING.md)

## Support

If you encounter installation issues:

1. Check [Troubleshooting](#common-installation-issues) above
2. Search existing [GitHub Issues](https://github.com/stoked-ui/sui/issues)
3. Create a new issue with:
   - Operating system and version
   - Node.js version (`node --version`)
   - FFmpeg version (`ffmpeg -version`)
   - Complete error message
   - Steps to reproduce

## Version Compatibility

| Package Version | Node.js | FFmpeg | TypeScript |
|----------------|---------|--------|------------|
| 0.1.x          | >=18.0  | >=4.0  | >=5.0      |

## License

MIT - See LICENSE file for details
