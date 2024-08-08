import path from 'path';
import fs from 'fs';
import { expect } from 'chai';
import sinon from 'sinon';
import { getStokedUiComponentInfo } from './getStokedUiComponentInfo';

describe('getStokedUiComponentInfo', () => {
  it('return correct info for material component file', () => {
    const componentInfo = getStokedUiComponentInfo(
      path.join(process.cwd(), `/packages/mui-material/src/Button/Button.js`),
    );
    sinon.assert.match(componentInfo, {
      name: 'Button',
      apiPathname: '/stoked-ui/api/button/',
      muiName: 'MuiButton',
      apiPagesDirectory: sinon.match((value) =>
        value.endsWith(path.join('docs', 'pages', 'stoked-ui', 'api')),
      ),
    });

    expect(componentInfo.getInheritance('ButtonBase')).to.deep.equal({
      name: 'ButtonBase',
      apiPathname: '/stoked-ui/api/button-base/',
    });

    let existed = false;
    try {
      fs.readdirSync(path.join(process.cwd(), 'docs/data'));
      existed = true;
      // eslint-disable-next-line no-empty
    } catch (error) {}
    if (existed) {
      expect(componentInfo.getDemos()).to.deep.equal([
        {
          demoPageTitle: 'Button Group',
          demoPathname: '/stoked-ui/react-button-group/',
        },
        {
          demoPageTitle: 'Button',
          demoPathname: '/stoked-ui/react-button/',
        },
      ]);
    }
  });
});
