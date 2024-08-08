#!/usr/bin/env ts-node

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Check if the filename is provided
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: cli-it <filename>');
  process.exit(1);
}

const filename = args[0];
const filePath = path.resolve(filename);
const commandName = path.basename(filename, '.sh');

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Create a symbolic link to the .sh file in a directory included in the PATH
const linkDir = '/usr/local/bin'; // You might need sudo privileges to write here
const linkPath = path.join(linkDir, commandName);

exec(`ln -sf ${filePath} ${linkPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error creating symlink: ${stderr}`);
    process.exit(1);
  }
  console.log(`Command '${commandName}' created. You can now run it from anywhere.`);
});
