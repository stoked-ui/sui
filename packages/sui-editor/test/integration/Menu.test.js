/**
 * ButtonMenu component that displays a button triggering a menu with selectable options.
 * @param {object} props - The component props.
 * @param {number} props.selectedIndex - The index of the selected option.
 * @returns {JSX.Element} React component
 * @example
 * <ButtonMenu selectedIndex={0} />
 */
function ButtonMenu(props) {
  const { selectedIndex: selectedIndexProp, ...other } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(selectedIndexProp || null);

  /**
   * Handles click event on the list item to set anchor element.
   * @param {React.MouseEvent} event - The click event
   */
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles click event on a menu item to update the selected index and close the menu.
   * @param {React.MouseEvent} event - The click event
   * @param {number} index - The index of the selected item
   */
  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  /**
   * Closes the menu by resetting the anchor element.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <Button
        aria-haspopup="true"
        aria-controls="lock-menu"
        aria-label="open menu"
        onClick={handleClickListItem}
      >
        {`selectedIndex: ${selectedIndex}, open: ${open}`}
      </Button>
      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        transitionDuration={0}
        BackdropProps={{ 'data-testid': 'Backdrop' }}
        {...other}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

ButtonMenu.propTypes = { selectedIndex: PropTypes.number };