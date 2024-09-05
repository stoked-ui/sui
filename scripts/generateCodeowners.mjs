/* eslint-disable no-console, no-restricted-syntax, no-continue */
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { ownership } from 'stokedui-com';

const {componentAreas, areaMaintainers, packageOwners, packageMaintainers, additionalRules} = ownership;

const thisDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const buffer = [];

function write(text) {
  buffer.push(text);
}

function save() {
  const fileContents = [...buffer, ''].join('\n');
  fs.writeFileSync(path.join(thisDirectory, '../.github/CODEOWNERS'), fileContents);
}

function findComponentArea(componentName) {
  // TODO: could make it smarter to reduce the number of entries in componentAreas
  // for example, "AccordionActions" could look up "Accordion"
  return componentAreas[componentName];
}

function normalizeComponentName(componentName) {
  // remove the "use" and "Unstable_" prefixes and "Unstyled" suffix
  return componentName.replace(/^(use|Unstable_)?(.*?)(Unstyled)?$/gm, '$2').toLowerCase();
}

function normalizeDocsComponentName(componentName) {
  switch (componentName) {
    case 'breadcrumbs':
    case 'progress':
    case 'transitions':
      return componentName;

    case 'badges':
      return 'badge';

    case 'floating-action-button':
      return 'fab';

    case 'focus-trap':
      return 'focustrap';

    case 'radio-buttons':
      return 'radio';

    case 'tables':
      return 'table';

    default:
      // remove the "use" and "Unstable" prefixes and remove the trailing "s" or "es" to make a singular form
      return componentName
        .replace(/^(use|Unstable)?(.*?)(es|s)?$/gm, '$2')
        .replace(/-/g, '')
        .toLowerCase();
  }
}

function getCodeowners(mapping) {
  return Object.entries(mapping)
    .map(([directory, maintainers]) => `${directory} @${maintainers.join(' @')}`)
    .join('\n');
}

function getAreaMaintainers(area, packageName) {
  return Array.from(
    new Set([
      ...areaMaintainers[area],
      // Material UI package owner is not added to individual components' owners
      // to reduce the number of PRs they'll get to review.
      ...(packageName === 'material' ? [] : packageOwners[packageName]),
    ]),
  )
    .map((name) => `@${name}`)
    .join(' ');
}

function processComponents(packageName) {
  const componentsDirectory = path.join(thisDirectory, `../packages/sui-${packageName}/src`);
  const componentDirectories = fs.readdirSync(componentsDirectory);
  const result = [];

  for (const componentDirectory of componentDirectories) {
    if (!fs.statSync(path.join(componentsDirectory, componentDirectory)).isDirectory()) {
      continue;
    }

    const componentName = normalizeComponentName(componentDirectory);
    const componentArea = findComponentArea(componentName);

    if (componentArea) {
      const maintainers = getAreaMaintainers(componentArea, packageName);
      const codeowners = `/packages/sui-${packageName}/src/${componentDirectory}/ ${maintainers}`;

      result.push(codeowners);
    } else {
      console.info(`No explicit owner defined for "${componentDirectory}" in ${packageName}.`);
    }
  }

  return result.join('\n');
}

function processDocs(packageName) {
  const docsDirectory = path.join(thisDirectory, `../docs/data/${packageName}/components`);
  const componentDirectories = fs.readdirSync(docsDirectory);
  const result = [];

  for (const componentDirectory of componentDirectories) {
    if (!fs.statSync(path.join(docsDirectory, componentDirectory)).isDirectory()) {
      continue;
    }

    const componentName = normalizeDocsComponentName(componentDirectory);
    const componentArea = findComponentArea(componentName);

    if (componentArea) {
      const maintainers = getAreaMaintainers(componentArea, packageName);
      const codeowners = `/docs/data/${packageName}/components/${componentDirectory}/ ${maintainers}`;
      result.push(codeowners);
    } else {
      console.info(
        `No explicit owner defined for docs of "${componentDirectory}" in ${packageName}.`,
      );
    }
  }

  return result.join('\n');
}

function processPackages() {
  return Object.entries(packageMaintainers)
    .map(([packageName, maintainers]) => `/packages/sui-${packageName}/ @${maintainers.join(' @')}`)
    .join('\n');
}

function run() {
  write('# This file is auto-generated, do not modify it manually.');
  write('# run `pnpm generate-codeowners` to update it.\n\n');

  write(getCodeowners(additionalRules));

  write('\n# Packages\n');
  write(processPackages());

  write('\n# Components - Material UI\n');
  write(processComponents('material'));
  write(processDocs('material'));

  write('\n# Components - Base UI\n');
  write(processComponents('base'));
  write(processDocs('base'));

  write('\n# Components - Joy UI\n');
  write(processComponents('joy'));
  write(processDocs('joy'));

  save();
}

run();
