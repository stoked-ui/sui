import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

const docsDataPath = path.resolve(process.cwd(), 'docs/data');

function getMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return getMarkdownFiles(nextPath);
    }

    return entry.name.endsWith('.md') ? [nextPath] : [];
  });
}

describe('component docs', () => {
  it('keeps runnable demos next to component pages that include code examples', () => {
    const offenders = getMarkdownFiles(docsDataPath)
      .filter((filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');
        const isComponentDoc = /^components:/m.test(content);
        const hasCodeFence = /```[\s\S]+?```/m.test(content);
        const hasDemo = /\{\{"demo":/m.test(content);

        return isComponentDoc && hasCodeFence && !hasDemo;
      })
      .map((filePath) => path.relative(process.cwd(), filePath));

    expect(
      offenders,
      'Component-focused docs pages with code examples should include at least one live demo.',
    ).to.deep.equal([]);
  });
});
