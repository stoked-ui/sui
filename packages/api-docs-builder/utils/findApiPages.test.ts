import { expect } from 'chai';
import { extractApiPage } from './findApiPages';

describe('extractApiPage', () => {
  it('return info for api page', () => {
    expect(
      extractApiPage('/stoked-ui/docs/pages/stoked-ui/api/accordion-actions.js'),
    ).to.deep.equal({
      apiPathname: '/stoked-ui/api/accordion-actions',
    });
  });
});
