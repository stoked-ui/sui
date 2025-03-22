const { execSync } = require('child_process');
const path = require('path');

// Run the identify-components script to see what needs documentation
console.log('Identifying components that need documentation...');
execSync('node scripts/identify-components.js', { 
  stdio: 'inherit',
  cwd: path.resolve(__dirname)
});

// Ask the user if they want to generate documentation
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('\nDo you want to generate documentation for all components? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('\nGenerating documentation for all components...');
    execSync('node scripts/generate-all-docs.js', { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname)
    });
  } else if (answer.toLowerCase() === 'no' || answer.toLowerCase() === 'n') {
    readline.question('\nWhich package do you want to generate documentation for? (e.g., sui-timeline, or "skip" to exit): ', (packageName) => {
      if (packageName.toLowerCase() !== 'skip') {
        console.log(`\nGenerating documentation for package: ${packageName}`);
        execSync(`node scripts/generate-all-docs.js ${packageName}`, { 
          stdio: 'inherit',
          cwd: path.resolve(__dirname)
        });
      }
      readline.close();
    });
  } else {
    console.log('Invalid answer. Exiting.');
    readline.close();
  }
});

console.log('\nAfter documentation is generated, you should manually review and enhance the generated documentation.');
console.log('See README-DOCS-GENERATION.md for best practices on writing good documentation.'); 