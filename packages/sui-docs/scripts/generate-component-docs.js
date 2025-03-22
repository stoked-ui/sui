const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

/**
 * Generate documentation for a component
 * @param {string} packageName - Name of the package (e.g., 'sui-timeline')
 * @param {string} componentName - Name of the component (e.g., 'Timeline')
 */
async function generateComponentDocs(packageName, componentName) {
  try {
    // Paths
    const packagePath = path.resolve(__dirname, '../../', packageName);
    const componentPath = path.join(packagePath, 'src', componentName);
    const docsPath = path.join(packagePath, 'docs', 'src', 'components', componentName);
    
    // Check if component exists
    if (!await exists(componentPath)) {
      console.error(`Component ${componentName} does not exist in package ${packageName}`);
      return;
    }
    
    // Create docs directory if it doesn't exist
    const dirStructure = [
      path.join(packagePath, 'docs'),
      path.join(packagePath, 'docs', 'src'),
      path.join(packagePath, 'docs', 'src', 'components'),
      docsPath
    ];
    
    for (const dir of dirStructure) {
      if (!await exists(dir)) {
        await mkdir(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
    
    // Get template
    const templatePath = path.join(__dirname, '../templates/component-doc-template.md');
    let template = await readFile(templatePath, 'utf8');
    
    // Try to read component types to extract props
    const typesFilePath = path.join(componentPath, `${componentName}.types.ts`);
    let propsTable = '| Name | Type | Default | Description |\n|:-----|:-----|:--------|:------------|\n';
    
    if (await exists(typesFilePath)) {
      const typesContent = await readFile(typesFilePath, 'utf8');
      
      // Very simple parsing for props from interface - this would need more sophisticated parsing in a real implementation
      const interfaceMatch = typesContent.match(/export\s+interface\s+(\w+Props)[^{]*{([^}]*)}/s);
      if (interfaceMatch && interfaceMatch[2]) {
        const propsSection = interfaceMatch[2];
        const propLines = propsSection.split('\n')
          .filter(line => line.trim() && !line.trim().startsWith('/*') && !line.trim().startsWith('*'))
          .map(line => {
            // Try to extract prop name, type, and description
            const propMatch = line.match(/(\w+)(\?)?:\s*(.*?);(.*)$/);
            if (propMatch) {
              const [, name, optional, type, comment] = propMatch;
              const description = comment.trim().startsWith('//') 
                ? comment.trim().substring(2).trim() 
                : '';
              return `| ${name} | ${type.trim()} | ${optional ? 'optional' : '-'} | ${description} |`;
            }
            return null;
          })
          .filter(Boolean);
        
        if (propLines.length > 0) {
          propsTable += propLines.join('\n');
        }
      }
    }
    
    // Replace placeholders in template
    template = template
      .replace(/Component Name/g, componentName)
      .replace(/@stoked-ui\/package-name/g, `@stoked-ui/${packageName}`)
      .replace(/Brief description of what the component does and its purpose./g, 
          `The ${componentName} component from ${packageName}.`)
      .replace(/\| prop1 \| type \| default \| Description of prop1 \|\n\| prop2 \| type \| default \| Description of prop2 \|\n\| prop3 \| type \| default \| Description of prop3 \|\n\| \.\.\. \| \.\.\. \| \.\.\. \| \.\.\. \|/g, 
          propsTable);
    
    // Write documentation file
    const docFilePath = path.join(docsPath, `${componentName.toLowerCase()}.md`);
    await writeFile(docFilePath, template);
    console.log(`Created documentation file: ${docFilePath}`);
    
    // Create basic example file
    const exampleContent = `import * as React from 'react';
import { ${componentName} } from '../../../../src';

export default function Basic${componentName}() {
  return (
    <${componentName} />
  );
}`;
    
    const exampleFilePath = path.join(docsPath, `Basic${componentName}.tsx`);
    await writeFile(exampleFilePath, exampleContent);
    console.log(`Created example file: ${exampleFilePath}`);
    
    // Create index file
    const indexContent = `export { default as Basic${componentName} } from './Basic${componentName}';`;
    const indexFilePath = path.join(docsPath, 'index.ts');
    await writeFile(indexFilePath, indexContent);
    console.log(`Created index file: ${indexFilePath}`);
    
    console.log(`Documentation generated for ${componentName} in ${packageName}`);
  } catch (error) {
    console.error('Error generating documentation:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node generate-component-docs.js <package-name> <component-name>');
  console.log('Example: node generate-component-docs.js sui-timeline Timeline');
  process.exit(1);
}

// Run the generator
generateComponentDocs(args[0], args[1]); 