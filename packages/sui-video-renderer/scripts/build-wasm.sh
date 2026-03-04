#!/usr/bin/env bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building WASM module for @stoked-ui/video-renderer-wasm${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Set paths
WASM_CRATE_DIR="${PROJECT_ROOT}/wasm-preview"
OUTPUT_DIR="${WASM_CRATE_DIR}/pkg"

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo -e "${RED}Error: wasm-pack is not installed${NC}"
    echo "Install it with: cargo install wasm-pack"
    exit 1
fi

echo -e "${YELLOW}Step 1/3: Cleaning previous build...${NC}"
rm -rf "${OUTPUT_DIR}"

echo -e "${YELLOW}Step 2/3: Building WASM with wasm-pack...${NC}"
cd "${WASM_CRATE_DIR}"
wasm-pack build \
    --target bundler \
    --out-dir "${OUTPUT_DIR}" \
    --release

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 3/3: Optimizing WASM binary...${NC}"
# Check if wasm-opt is available (optional optimization)
if command -v wasm-opt &> /dev/null; then
    WASM_FILE="${OUTPUT_DIR}/wasm_preview_bg.wasm"
    if [ -f "${WASM_FILE}" ]; then
        echo "Running wasm-opt -Oz with WASM feature flags..."
        wasm-opt -Oz \
            --enable-bulk-memory \
            --enable-nontrapping-float-to-int \
            --enable-sign-ext \
            --enable-mutable-globals \
            "${WASM_FILE}" -o "${WASM_FILE}.opt"
        mv "${WASM_FILE}.opt" "${WASM_FILE}"
        echo -e "${GREEN}Optimization complete!${NC}"
    else
        echo -e "${YELLOW}Warning: WASM file not found at ${WASM_FILE}${NC}"
    fi
else
    echo -e "${YELLOW}wasm-opt not found, skipping optimization (install binaryen for smaller builds)${NC}"
fi

# Fix package name for workspace resolution
echo -e "${YELLOW}Fixing package name...${NC}"
if [ -f "${OUTPUT_DIR}/package.json" ]; then
    sed -i '' 's/"name": "wasm-preview"/"name": "@stoked-ui\/video-renderer-wasm"/' "${OUTPUT_DIR}/package.json"
    echo -e "${GREEN}Package name set to @stoked-ui/video-renderer-wasm${NC}"
fi

# Display build info
echo ""
echo -e "${GREEN}Build successful!${NC}"
echo ""
echo "Output directory: ${OUTPUT_DIR}"
echo "Generated files:"
ls -lh "${OUTPUT_DIR}" | grep -v "^total" || true
echo ""
echo -e "${GREEN}WASM module ready at: ${OUTPUT_DIR}${NC}"
