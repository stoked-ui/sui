/**
 * Examples of using @stoked-ui/common in different environments
 */

// ESM (Modern) Import
// This syntax works in environments that support ES modules (browsers, Node.js 14+)
import { LocalDb, FetchBackoff } from '@stoked-ui/common';

// Example: Using LocalDb
async function localDbExample() {
  const db = new LocalDb('example-db');

  // Store data
  await db.set('user', { name: 'Alice', role: 'admin' });

  // Retrieve data
  const user = await db.get('user');
  console.log('User from LocalDb:', user);

  // Delete data
  await db.delete('user');
}

// Example: Using FetchBackoff
async function fetchWithBackoffExample() {
  try {
    const data = await FetchBackoff.fetch('https://api.example.com/data', {
      retries: 3,
      initialDelay: 500,
      maxDelay: 5000
    });

    console.log('Fetched data:', data);
  } catch (error) {
    console.error('Failed to fetch after retries:', error);
  }
}

// Run examples
(async () => {
  console.log('Running LocalDb example...');
  await localDbExample();

  console.log('Running FetchBackoff example...');
  await fetchWithBackoffExample();
})().catch(console.error);

/**
 * CommonJS (Legacy) Import Example:
 *
 * // For Node.js environments that use CommonJS
 * const { LocalDb, FetchBackoff } = require('@stoked-ui/common');
 *
 * // The rest of the code would be identical to the above example
 */
