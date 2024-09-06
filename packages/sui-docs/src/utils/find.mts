import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';

const currentDirectory = url.fileURLToPath(new URL('.', import.meta.url));

const pageRegex = /(\.js|\.tsx)$/;
const blackList = ['/.eslintrc', '/_document', '/_app'];

/**
 * @typedef {object} NextJSPage
 * @property {string} pathname
 * @property {NextJSPage[]} [children]
 */
interface NextJSPage {
  pathname: string;
  children?: NextJSPage[];
}

/**
 * Returns the Next.js pages available in a nested format.
 * The output is in the next.js format.
 * Each pathname is a route you can navigate to.
 * @param {{ front: true }} [options]
 * @param {string} [directory]
 * @param {NextJSPage[]} pages
 * @returns {NextJSPage[]}
 */
export function findPages(
  { front, product, directory }: { front?: boolean, product?: string, directory?: string } = {},
  pages: NextJSPage[] = [],
): NextJSPage[] {
  const options = { front, product, directory };
  if (!directory) {
    const subPath = product ? `packages/${product}` : '../../docs';
    directory = path.resolve(currentDirectory, '../../', subPath, 'pages')
  }
  fs.readdirSync(directory).forEach((item) => {
    const itemPath = path.resolve(directory, item);
    const pathname = itemPath
      .replace(new RegExp(`\\${path.sep}`, 'g'), '/')
      .replace(/^.*\/pages/, '')
      .replace('.js', '')
      .replace('.tsx', '')
      .replace(/^\/index$/, '/') // Replace `index` by `/`.
      .replace(/\/index$/, '');

    if (pathname.indexOf('.eslintrc') !== -1) {
      return;
    }

    if (
      options.front &&
      pathname.indexOf('/components') === -1 &&
      pathname.indexOf('/api-docs') === -1
    ) {
      return;
    }

    if (fs.statSync(itemPath).isDirectory()) {
      options.directory = itemPath;
      const children: NextJSPage[] = [];
      pages.push({
        pathname,
        children,
      });
      findPages(options, children);
      return;
    }

    if (!pageRegex.test(item) || blackList.includes(pathname)) {
      return;
    }

    pages.push({
      pathname,
    });
  });

  // sort by pathnames without '-' so that e.g. card comes before card-action
  pages.sort((a, b) => {
    const pathnameA = a.pathname.replace(/-/g, '');
    const pathnameB = b.pathname.replace(/-/g, '');
    if (pathnameA < pathnameB) {
      return -1;
    }
    if (pathnameA > pathnameB) {
      return 1;
    }
    return 0;
  });

  return pages;
}
