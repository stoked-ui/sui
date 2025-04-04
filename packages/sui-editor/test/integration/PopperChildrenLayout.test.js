import * as React from 'react';
import { expect } from 'chai';
import { spy } from 'sinon';
import { createRenderer } from '@mui-internal/test-utils';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';
import Popper from '@mui/material/Popper';

/**
 * @description Test suite for <Popper /> component
 */
describe('<Popper />', () => {
  /**
   * @typedef {boolean} IsSafari
   * @property {string} userAgent - User agent string
   */

  let isSafari;
  const { render } = createRenderer();

  /**
   * @description Test setup for test suite
   */
  beforeEach(() => {
    isSafari = /Chrome|Safari/i.test(window.navigator.userAgent);
  });

  /**
   * @description Test case for <Popper /> autofocus behavior
   */
  it('autoFocus does not scroll', () => {
    const handleFocus = spy();
    const { setProps } = render(
      <BottomAnchoredPopper open={false}>
        {({ TransitionProps }) => (
          <TransitionComponent {...TransitionProps}>
            <div>
              <button autoFocus onFocus={handleFocus}>will be focused</button>
            </div>
          </TransitionComponent>
        )}
      </BottomAnchoredPopper>,
    );
    expect(handleFocus.callCount).to.equal(0);
    const scrollYBeforeOpen = window.scrollY;

    setProps({ open: true });

    expect(handleFocus.callCount).to.equal(1);
    expect(window.scrollY, 'focus caused scroll').to.equal(scrollYBeforeOpen);
  });

  /**
   * @description Test case for <Popper /> autofocus behavior with layout effect
   */
  it('focus during layout effect does not scroll', () => {
    const handleFocus = spy();
    function LayoutEffectFocusButton(props) {
      const buttonRef = React.useRef(null);
      React.useLayoutEffect(() => {
        buttonRef.current.focus();
      }, []);
      return <button {...props} ref={buttonRef} />;
    }
    const { setProps } = render(
      <BottomAnchoredPopper open={false}>
        {({ TransitionProps }) => (
          <TransitionComponent {...TransitionProps}>
            <div>
              <LayoutEffectFocusButton onFocus={handleFocus}>will be focused</LayoutEffectFocusButton>
            </div>
          </TransitionComponent>
        )}
      </BottomAnchoredPopper>,
    );
    expect(handleFocus.callCount).to.equal(0);
    const scrollYBeforeOpen = window.scrollY;

    setProps({ open: true });

    expect(handleFocus.callCount).to.equal(1);
    expect(window.scrollY, 'focus caused scroll').to.equal(scrollYBeforeOpen);
  });

  /**
   * @description Test case for <Popper /> autofocus behavior with passive effects
   */
  it('focus during passive effects do not scroll', () => {
    const handleFocus = spy();
    function EffectFocusButton(props) {
      const buttonRef = React.useRef(null);
      React.useEffect(() => {
        buttonRef.current.focus();
      }, []);
      return <button {...props} ref={buttonRef} />;
    }
    const { setProps } = render(
      <BottomAnchoredPopper open={false}>
        {({ TransitionProps }) => (
          <TransitionComponent timeout={0} {...TransitionProps}>
            <div>
              <EffectFocusButton onFocus={handleFocus}>will be focused</EffectFocusButton>
            </div>
          </TransitionComponent>
        )}
      </BottomAnchoredPopper>,
    );
    expect(handleFocus.callCount).to.equal(0);
    const scrollYBeforeOpen = window.scrollY;

    setProps({ open: true });

    expect(handleFocus.callCount).to.equal(1);
    if (isSafari) {
      expect(window.scrollY, 'focus caused scroll').to.equal(scrollYBeforeOpen);
    } else {
      // FIXME: should equal
      expect(window.scrollY, 'focus caused scroll').not.to.equal(scrollYBeforeOpen);
    }
  });

  /**
   * @description Test cases for <Popper /> with different transition components
   */
  [
    [Collapse, 'Collapse'],
    [Fade, 'Fade'],
    [Grow, 'Grow'],
    [Slide, 'Slide'],
    [Zoom, 'Zoom'],
  ].forEach(([TransitionComponent, name]) => {
    describe(`in TransitionComponent ${name}`, () => {
      it('autoFocus does not scroll', () => {
        const handleFocus = spy();
        const { setProps } = render(
          <BottomAnchoredPopper open={false} transition>
            {({ TransitionProps }) => (
              <TransitionComponent {...TransitionProps}>
                <div>
                  <button autoFocus onFocus={handleFocus}>will be focused</button>
                </div>
              </TransitionComponent>
            )}
          </BottomAnchoredPopper>,
        );
        expect(handleFocus.callCount).to.equal(0);
        const scrollYBeforeOpen = window.scrollY;

        setProps({ open: true });

        expect(handleFocus.callCount).to.equal(1);
        expect(window.scrollY, 'focus caused scroll').to.equal(scrollYBeforeOpen);
      });

      it('focus during layout effect does not scroll', () => {
        const handleFocus = spy();
        function LayoutEffectFocusButton(props) {
          const buttonRef = React.useRef(null);
          React.useLayoutEffect(() => {
            buttonRef.current.focus();
          }, []);
          return <button {...props} ref={buttonRef} />;
        }
        const { setProps } = render(
          <BottomAnchoredPopper open={false}>
            {({ TransitionProps }) => (
              <TransitionComponent {...TransitionProps}>
                <div>
                  <LayoutEffectFocusButton onFocus={handleFocus}>will be focused</LayoutEffectFocusButton>
                </div>
              </TransitionComponent>
            )}
          </BottomAnchoredPopper>,
        );
        expect(handleFocus.callCount).to.equal(0);
        const scrollYBeforeOpen = window.scrollY;

        setProps({ open: true });

        expect(handleFocus.callCount).to.equal(1);
        expect(window.scrollY, 'focus caused scroll').to.equal(scrollYBeforeOpen);
      });

      it('focus during passive effects do not scroll', () => {
        const handleFocus = spy();
        function EffectFocusButton(props) {
          const buttonRef = React.useRef(null);
          React.useEffect(() => {
            buttonRef.current.focus();
          }, []);
          return <button {...props} ref={buttonRef} />;
        }
        const { setProps } = render(
          <BottomAnchoredPopper open={false}>
            {({ TransitionProps }) => (
              <TransitionComponent timeout={0} {...TransitionProps}>
                <div>
                  <EffectFocusButton onFocus={handleFocus}>will be focused</EffectFocusButton>
                </div>
              </TransitionComponent>
            )}
          </BottomAnchoredPopper>,
        );
        expect(handleFocus.callCount).to.equal(0);
        const scrollYBeforeOpen = window.scrollY;

        setProps({ open: true });

        expect(handleFocus.callCount).to.equal(1);
        if (isSafari) {
          expect(window.scrollY, 'focus caused scroll').to.equal(scrollYBeforeOpen);
        } else {
          // FIXME: should equal
          expect(window.scrollY, 'focus caused scroll').not.to.equal(scrollYBeforeOpen);
        }
      });
    });
  });
});