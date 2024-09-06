import addHiddenInput from '../utils/addHiddenInput';
import { CODE_VARIANTS } from '../components/constants';
import SandboxDependencies from './Dependencies';
import * as CRA from './CreateReactApp';
import getFileExtension from './FileExtension';
import { DemoData } from './types';

function createReactApp(demoData: DemoData) {
  const ext = getFileExtension(demoData.codeVariant);
  const { title, githubLocation: description } = demoData;

  const files: Record<string, string> = {
    'index.html': CRA.getHtml(demoData),
    [`index.${ext}`]: CRA.getRootIndex(demoData),
    [`Demo.${ext}`]: demoData.raw,
    ...(demoData.codeVariant === 'TS' && {
      'tsconfig.json': CRA.getTsconfig(),
    }),
  };

  const { dependencies, devDependencies } = SandboxDependencies(demoData, {
    // Waiting for https://github.com/stackblitz/core/issues/437
    // commitRef: process.env.PULL_REQUEST_ID ? process.env.COMMIT_REF : undefined,
  });

  return {
    title,
    description,
    files,
    dependencies,
    devDependencies,
    openSandbox: (initialFile = `Demo.${ext}`) => {
      const extension = demoData.codeVariant === CODE_VARIANTS.TS ? '.tsx' : '.js';
      // ref: https://developer.stackblitz.com/docs/platform/post-api/
      const form = document.createElement('form');
      form.method = 'POST';
      form.target = '_blank';
      form.action = `https://stackblitz.com/run?file=${initialFile}${
        initialFile.match(/(\.tsx|\.ts|\.js)$/) ? '' : extension
      }`;
      addHiddenInput(form, 'project[template]', 'create-react-app');
      addHiddenInput(form, 'project[title]', title);
      addHiddenInput(form, 'project[description]', `# ${title}\n${description}`);
      addHiddenInput(form, 'project[dependencies]', JSON.stringify(dependencies));
      addHiddenInput(form, 'project[devDependencies]', JSON.stringify(devDependencies));
      Object.keys(files).forEach((key) => {
        const value = files[key];
        addHiddenInput(form, `project[files][${key}]`, value);
      });
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    },
  };
}

export default {
  createReactApp,
};
