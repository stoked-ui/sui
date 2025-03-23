# Stoked UI - Common

A robust, tree-shakable collection of utilities and components for the Stoked UI ecosystem.

## Features

- ✅ **Tree-shakable**: Only import what you need
- ✅ **TypeScript**: Full TypeScript support with type definitions
- ✅ **Modern & Legacy Support**: Works in both ESM and CommonJS environments
- ✅ **Minimal Dependencies**: Clean dependency tree
- ✅ **Optimized Bundle**: Minimal bundle size impact

## Installation

Install the package in your project directory with:

```bash
# npm
npm install @stoked-ui/common

# yarn
yarn add @stoked-ui/common

# pnpm
pnpm add @stoked-ui/common
```

## Usage

### ESM (Modern) Import

```javascript
import { LocalDb } from '@stoked-ui/common';
```

### CommonJS (Legacy) Import

```javascript
const { LocalDb } = require('@stoked-ui/common');
```

## Available Utilities

This package includes various utility modules:

- **LocalDb**: A wrapper around IndexedDB for simplified data storage
- **Colors**: Color utility functions and constants
- **ProviderState**: State management utilities for context providers
- **FetchBackoff**: Utilities for fetching with exponential backoff
- **MimeType**: MIME type detection and handling utilities
- **Ids**: Utilities for generating and managing unique identifiers
- **GrokLoader**: Utility for loading Grok models

## Example

```javascript
import { LocalDb } from '@stoked-ui/common';

// Initialize a local database
const db = new LocalDb('myApp');

// Store data
await db.set('user', { name: 'John', age: 30 });

// Retrieve data
const user = await db.get('user');
console.log(user); // { name: 'John', age: 30 }
```

## Browser Compatibility

This package is compatible with all modern browsers and IE11+ with appropriate polyfills.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
