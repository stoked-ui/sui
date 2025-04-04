import * as React from 'react';
import { expect } from 'chai';
import { createRenderer, within } from '@mui-internal/test-utils';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

/**
 * NoTransition component - A wrapper around a div with a ref
 *
 * @param props - Component properties
 * @param ref - Ref for the wrapped element
 * @returns The rendered component
 */
const NoTransition = React.forwardRef(function NoTransition(props, ref) {
  const { children, in: inProp } = props;
  if (!inProp) {
    return null;
  }
  return <div ref={ref}>{children}</div>;
});

/**
 * NestedMenu component - A menu with nested menus
 *
 * @param props - Component properties
 * @param props.firstMenuOpen - Whether the first menu is open
 * @param props.secondMenuOpen - Whether the second menu is open
 * @returns The rendered component
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
      {/* 
        Menu component - An anchor el menu with custom props
        - hideBackdrop: Hides the backdrop of the menu
        - MenuListProps.id: Sets the id of the menu list prop
        - open: Conditionally opens the menu based on secondMenuOpen and canBeOpen
        - TransitionComponent: Uses NoTransition for the transition component
      */}
      <Menu
        anchorEl={anchorEl}
        hideBackdrop
        MenuListProps={{ id: 'second-menu' }}
        open={Boolean(secondMenuOpen && canBeOpen)}
        TransitionComponent={NoTransition}
      >
        <MenuItem>Second Menu</MenuItem>
      </Menu>
      {/* 
        Menu component - An anchor el menu with custom props
        - hideBackdrop: Hides the backdrop of the menu
        - MenuListProps.id: Sets the id of the menu list prop
        - open: Conditionally opens the menu based on firstMenuOpen and canBeOpen
        - TransitionComponent: Uses NoTransition for the transition component
      */}
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
 * Test suite for NestedMenu component integration
 */
describe('<NestedMenu> integration', () => {
  const { render } = createRenderer();

  it('should not be open', () => {
    // Test that the first menu is not open by default
    const { queryAllByRole } = render(<NestedMenu />);

    expect(queryAllByRole('menu')).to.have.length(0);
  });

  it('should focus the first item of the first menu when nothing has been selected', () => {
    // Test that the first menu focuses when opened and no item is selected
    const { getByRole } = render(<NestedMenu firstMenuOpen />);

    expect(getByRole('menu')).to.have.id('first-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('should focus the first item of the second menu when nothing has been selected', () => {
    // Test that the second menu focuses when opened and no item is selected
    const { getByRole } = render(<NestedMenu secondMenuOpen />);

    expect(getByRole('menu')).to.have.id('second-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('should open the first menu after it was closed', () => {
    // Test that the first menu opens when reopened
    const { getByRole, setProps } = render(<NestedMenu firstMenuOpen />);

    setProps({ firstMenuOpen: false });
    setProps({ firstMenuOpen: true });

    expect(getByRole('menu')).to.have.id('first-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('should be able to open second menu again', () => {
    // Test that the second menu opens when reopened
    const { getByRole, setProps } = render(<NestedMenu secondMenuOpen />);

    setProps({ secondMenuOpen: false });
    setProps({ secondMenuOpen: true });

    expect(getByRole('menu')).to.have.id('second-menu');
    expect(within(getByRole('menu')).getAllByRole('menuitem')[0]).toHaveFocus();
  });
});