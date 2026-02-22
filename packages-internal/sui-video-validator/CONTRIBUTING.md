# Contributing to @stoked-ui/video-validator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the video validator.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/stoked-ui/sui.git
   cd sui/packages/sui-video-validator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Install FFmpeg** (if not already installed)
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # Windows
   choco install ffmpeg
   ```

4. **Build the project**
   ```bash
   pnpm build
   ```

## Development Workflow

### Building

```bash
# Build once
pnpm build

# Build and watch for changes
pnpm dev
```

### Testing

```bash
# Run tests
pnpm test

# Note: Tests require test video files in tests/fixtures/
# reference.mp4 and output.mp4
```

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier (configured in root)
- Write JSDoc comments for public APIs
- Keep functions focused and single-purpose

## Project Structure

```
sui-video-validator/
├── src/
│   ├── VideoValidator.ts      # Core validation logic
│   ├── BatchValidator.ts      # Batch processing
│   ├── Reporter.ts            # Report generation
│   ├── types.ts               # TypeScript definitions
│   └── index.ts               # Public API exports
├── bin/
│   └── cli.js                 # CLI interface
├── tests/
│   ├── validator.test.ts      # Integration tests
│   └── fixtures/              # Test video files
├── examples/
│   ├── usage-example.ts       # Usage examples
│   └── batch-config.json      # Batch config example
└── README.md
```

## Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add/update tests as needed
   - Update documentation

3. **Test your changes**
   ```bash
   pnpm build
   pnpm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   **Commit message format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Test additions/updates
   - `refactor:` Code refactoring
   - `perf:` Performance improvements

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing Guidelines

### Unit Tests

- Test individual functions and methods
- Mock external dependencies (FFmpeg, file system)
- Cover edge cases and error conditions

### Integration Tests

- Test complete workflows
- Use real video files (small, < 1MB)
- Verify all output formats

### Test Video Files

Place test videos in `tests/fixtures/`:
- `reference.mp4`: Reference video (small, 2-5 seconds)
- `output.mp4`: Output video (should be similar to reference)

## Documentation

### Code Comments

```typescript
/**
 * Brief description of the function
 *
 * Detailed explanation if needed
 *
 * @param paramName - Parameter description
 * @returns Return value description
 * @throws ErrorType - When and why errors are thrown
 *
 * @example
 * ```typescript
 * const result = await myFunction('example');
 * ```
 */
```

### README Updates

- Keep examples up-to-date
- Document new features and options
- Include troubleshooting tips

## Performance Considerations

- Frame extraction is I/O intensive
- Pixel comparison is CPU intensive
- Consider memory usage with large videos
- Use batch concurrency wisely

## Security

- Validate all file paths
- Sanitize user inputs
- Handle errors gracefully
- Don't expose internal paths in errors

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Publish to npm

## Getting Help

- Open an issue for bugs or questions
- Join discussions for feature ideas
- Check existing issues before creating new ones

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
