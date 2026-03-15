import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { FileExplorer } from './FileExplorer';
import { fileClasses } from '../File';

type TestItem = {
  id: string;
  name: string;
  type: string;
  mediaType: string;
  size: number;
  lastModified: number;
  children?: TestItem[];
};

const { render } = createRenderer();

const createItem = (id: string, children?: TestItem[]): TestItem => ({
  id,
  name: id,
  type: children?.length ? 'folder' : 'doc',
  mediaType: children?.length ? 'folder' : 'doc',
  size: 0,
  lastModified: 0,
  children,
});

describe('<FileExplorer /> alternating rows', () => {
  let renderResult: ReturnType<typeof render>;

  const getContent = (label: string) => {
    const content = renderResult.getByText(label).closest(`.${fileClasses.content}`);

    if (!content) {
      throw new Error(`Could not find content row for "${label}"`);
    }

    return content as HTMLElement;
  };

  const expectRowClass = (label: string, rowClass: 'Mui-even' | 'Mui-odd') => {
    const content = getContent(label);
    const oppositeRowClass = rowClass === 'Mui-even' ? 'Mui-odd' : 'Mui-even';

    expect(content.classList.contains(rowClass)).to.equal(true);
    expect(content.classList.contains(oppositeRowClass)).to.equal(false);
  };

  it('recomputes odd/even rows after filtering items out and restoring them', () => {
    const fullItems = [
      createItem('group', [createItem('a'), createItem('b')]),
      createItem('after'),
    ];

    renderResult = render(
      <FileExplorer
        alternatingRows
        defaultExpandedItems={['group']}
        items={fullItems}
      />,
    );

    expectRowClass('group', 'Mui-even');
    expectRowClass('a', 'Mui-odd');
    expectRowClass('b', 'Mui-even');
    expectRowClass('after', 'Mui-odd');

    renderResult.setProps({
      alternatingRows: true,
      defaultExpandedItems: ['group'],
      items: [createItem('group', [createItem('b')]), createItem('after')],
    });

    expectRowClass('group', 'Mui-even');
    expectRowClass('b', 'Mui-odd');
    expectRowClass('after', 'Mui-even');

    renderResult.setProps({
      alternatingRows: true,
      defaultExpandedItems: ['group'],
      items: fullItems,
    });

    expectRowClass('group', 'Mui-even');
    expectRowClass('a', 'Mui-odd');
    expectRowClass('b', 'Mui-even');
    expectRowClass('after', 'Mui-odd');
  });
});
