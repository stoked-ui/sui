const React = require('react');
const { expect } = require('chai');
const { ThemeProvider } = require('@mui/material/styles');
const { createRenderer } = require('@stoked-ui/internal-test-utils');
const { brandingLightTheme } = require('../../../packages/sui-docs/src/branding/brandingTheme');
const HeroContainer = require('docs/src/layouts/HeroContainer').default;
const FrontEnd = require('docs/pages/consulting/front-end/main').default;
const BackEnd = require('docs/pages/consulting/back-end/main').default;
const FullStack = require('docs/pages/consulting/full-stack/main').default;
const Devops = require('docs/pages/consulting/devops/main').default;
const Ai = require('docs/pages/consulting/ai/main').default;

function declarationsFor(element) {
  const classes = [...element.classList];
  let text = [...document.querySelectorAll('style')].map((style) => style.textContent || '').join('\n');
  if (!text && document.styleSheets) {
    [...document.styleSheets].forEach((sheet) => {
      try {
        [...sheet.cssRules].forEach((rule) => {
          text += `${rule.cssText}\n`;
        });
      } catch (error) {
        text += '';
      }
    });
  }
  const bodies = [];
  classes.forEach((className) => {
    let from = 0;
    const needle = `.${className}`;
    while (from < text.length) {
      const idx = text.indexOf(needle, from);
      if (idx === -1) {
        break;
      }
      bodies.push(text.slice(idx, idx + 500));
      from = idx + needle.length;
    }
  });
  return bodies.join('\n');
}

describe('consulting heroes', () => {
  const { render } = createRenderer();

  function mount(node) {
    return render(React.createElement(ThemeProvider, { theme: brandingLightTheme }, node));
  }

  it('keeps left copy when the right pane is empty and oversized', function testOversizedRight() {
    this.timeout(20000);
    const view = mount(
      React.createElement(HeroContainer, {
        left: React.createElement(
          'div',
          null,
          React.createElement('h1', null, 'Interfaces That Convert.'),
          React.createElement('p', null, 'Supporting copy stays in the left column.'),
        ),
        right: React.createElement(React.Fragment),
        rightSx: { minWidth: 2000, width: 2000 },
      }),
    );

    const heading = view.getByRole('heading', { name: /Interfaces That Convert/ });
    const left = view.container.querySelector('[data-hero-column="left"]');
    const pane = view.container.querySelector('[data-hero-pane="right"]');
    expect(left).to.not.equal(null);
    expect(left.contains(heading)).to.equal(true);
    expect(pane).to.not.equal(null);

    const css = declarationsFor(pane);
    expect(css).to.match(/min-width:\s*0/);
    expect(css).to.not.match(/min-width:\s*2000/);

    const leftCss = declarationsFor(left);
    expect(leftCss).to.match(/flex-shrink:\s*0/);
  });

  const variants = [
    {
      name: 'front-end',
      Page: FrontEnd,
      heading: /Interfaces That/,
      support: /25\+ years building for the web/,
      visual: 'front-end',
    },
    {
      name: 'back-end',
      Page: BackEnd,
      heading: /Scalable/,
      support: /bulletproof back-ends/,
      visual: 'back-end',
    },
    {
      name: 'full-stack',
      Page: FullStack,
      heading: /Full Stack/,
      support: /since 2010/,
      visual: 'full-stack',
    },
    {
      name: 'devops',
      Page: Devops,
      heading: /DevOps/,
      support: /ship with confidence/,
      visual: 'devops',
    },
    {
      name: 'ai',
      Page: Ai,
      heading: /AI That/,
      support: /production-grade AI systems/,
      visual: null,
    },
  ];

  variants.forEach(({ name, Page, heading, support, visual }) => {
    it(`${name} shows a left headline, supporting copy, and a right visual`, function testVariant() {
      this.timeout(30000);
      const view = mount(React.createElement(Page));
      const headingNode = view.getByRole('heading', { level: 1, name: heading });
      const left = view.container.querySelector('[data-hero-column="left"]');
      const right = view.container.querySelector('[data-hero-column="right"]');
      expect(left, `${name} left column`).to.not.equal(null);
      expect(left.contains(headingNode)).to.equal(true);
      expect(left.textContent).to.match(support);
      expect(right, `${name} right column`).to.not.equal(null);
      expect(right.childElementCount).to.be.greaterThan(0);
      if (visual) {
        expect(view.container.querySelector(`[data-hero-visual="${visual}"]`)).to.not.equal(null);
      }
      if (name === 'ai') {
        expect(view.getByText(/Start your audit/)).to.not.equal(null);
      }
      expect(right.textContent.trim()).to.not.equal('');
      const pane = right.querySelector('[data-hero-pane="right"]') || right;
      expect(declarationsFor(pane)).to.not.match(/min-width:\s*2000/);
    });
  });
});
