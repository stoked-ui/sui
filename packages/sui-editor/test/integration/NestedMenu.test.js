import * as React from 'react';
import { expect } from 'chai';
import { createRenderer, within } from '@mui-internal/test-utils';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

/**
 * React component that renders children without any transition effect.
 * @param {object} props - Component props
 * @param {boolean} props.in - Whether the component is in the transition state
 * @param {React.Ref} ref - Reference to the DOM element
 * @returns {JSX.Element} React element
 */
const NoTransition = React.forwardRef(function NoTransition(props, ref) {
  const { children, in: inProp } = props;
  if (!inProp) {
    return null;
  }
  return <div ref={ref}>{children}</div>;
});

/**
 * React component that represents a nested menu structure.
 * @param {object} props - Component props
 * @param {boolean} props.firstMenuOpen - Whether the first menu is open
 * @param {boolean} props.secondMenuOpen - Whether the second menu is open
 * @returns {JSX.Element} React element
 */
function NestedMenu(props) {
  const { firstMenuOpen, secondMenuOpen } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const canBeOpen = Boolean(anchorEl);

  return (
    <div>
      <button type="button" ref={setAnchorEl}>
        anchor
      </button>
      <Menu
        anchorEl={anchorEl}
        hideBackdrop
        MenuListProps={{ id: 'second-menu' }}
        open={Boolean(secondMenuOpen && canBeOpen)}
        TransitionComponent={NoTransition}
      >
        <MenuItem>Second Menu</MenuItem>
      </Menu>
      <Menu
        anchorEl={anchorEl}
        hideBackdrop
        MenuListProps={{ id: 'first-menu' }}
        open={Boolean(firstMenuOpen && canBeOpen)}
        TransitionComponent={NoTransition}
      >
        <MenuItem>Profile 1</MenuItem>
        <MenuItem>My account</MenuItem>
        <MenuItem>Logout</MenuItem>
      </Menu>
    </div>
  );
}

/**
 * Integration tests for the <NestedMenu> component.
 */
describe('<NestedMenu> integration', () => {
  const { render } = createRenderer();

  it('should not be open', () => {
    const { queryAllByRole } = render(<NestedMenu />);

    expect(queryAllByRole('menu')).to.have.length(0);
  });

  it('should focus the first item of the first menu when nothing has been selected', () => {
    const { getByRole } = render(<NestedMenu firstMenuOpen />);

    expect(getByRole('menu')).to.have.id('first-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('should focus the first item of the second menu when nothing has been selected', () => {
    const { getByRole } = render(<NestedMenu secondMenuOpen />);

    expect(getByRole('menu')).to.have.id('second-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('should open the first menu after it was closed', () => {
    const { getByRole, setProps } = render(<NestedMenu firstMenuOpen />);

    setProps({ firstMenuOpen: false });
    setProps({ firstMenuOpen: true });

    expect(getByRole('menu')).to.have.id('first-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('should be able to open second menu again', () => {
    const { getByRole, setProps } = render(<NestedMenu secondMenuOpen />);

    setProps({ secondMenuOpen: false });
    setProps({ secondMenuOpen: true });

    expect(getByRole('menu')).to.have.id('second-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });
});