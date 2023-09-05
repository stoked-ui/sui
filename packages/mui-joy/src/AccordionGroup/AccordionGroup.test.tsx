import * as React from 'react';
import { expect } from 'chai';
import { createRenderer, describeConformance } from 'test/utils';
import { ThemeProvider } from '@mui/joy/styles';
import AccordionGroup, { accordionGroupClasses as classes } from '@mui/joy/AccordionGroup';

describe('<AccordionGroup />', () => {
  const { render } = createRenderer();

  describeConformance(<AccordionGroup />, () => ({
    classes,
    inheritComponent: 'div',
    render,
    ThemeProvider,
    muiName: 'JoyAccordionGroup',
    refInstanceof: window.HTMLDivElement,
    testComponentPropWith: 'span',
    skip: ['classesRoot', 'componentsProp', 'themeVariants'],
    slots: {
      root: {
        expectedClassName: classes.root,
      },
    },
  }));

  describe('classes', () => {
    (
      [
        { size: 'sm', class: classes.sizeSm },
        { size: 'md', class: classes.sizeMd },
        { size: 'lg', class: classes.sizeLg },
      ] as const
    ).forEach((sizeConfig) => {
      it(`should have ${sizeConfig.class} class for ${sizeConfig.size} size `, () => {
        const { getByTestId } = render(
          <AccordionGroup data-testid="root" size={sizeConfig.size} />,
        );

        expect(getByTestId('root')).to.have.class(sizeConfig.class);
      });
    });
  });
});
