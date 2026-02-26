#!/usr/bin/env bash
# Build the docs site as a static export and run pagefind indexing.
# Uses a separate distDir to avoid Next.js 13.5 race conditions
# when distDir and output:'export' point to the same directory.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Cleaning previous build artifacts..."
rm -rf export .next-export

echo "Building static site..."
NEXT_DIST_DIR=.next-export NODE_ENV=production npx next build

echo "Moving build output to export/..."
mv .next-export export

echo "Running pagefind indexer..."
npx pagefind --site export --output-subdir pagefind

echo "Build complete. Index at export/pagefind/"
