#!/bin/bash

# Source file
SOURCE_FILE="./src/translations/translations.json"

# Root directory to search
ROOT_DIR="./build"

# Ensure source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: Source file '$SOURCE_FILE' not found."
    exit 1
fi

# Find all directories named 'translations' under ROOT_DIR and copy the file
find "$ROOT_DIR" -type d -name "translations" | while read -r dir; do
    cp "$SOURCE_FILE" "$dir/"
    echo "Copied to: $dir"
done

echo "Copy operation complete"
