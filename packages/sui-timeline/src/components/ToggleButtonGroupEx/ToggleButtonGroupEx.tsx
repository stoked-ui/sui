/**
 * ToggleButtonGroupEx component for custom toggle button group styling.
 * @description A customizable toggle button group component with styled buttons.
 * @param {object} props - The props for the ToggleButtonGroupEx component.
 * @property {number} props.id - The ID of the component.
 * @property {object} props.sx - The system prop for defining system overrides and CSS styles.
 * @property {function} props.onChange - The function to handle change events.
 * @property {any} props.value - The value of the component.
 * @property {array} props.children - The content of the component.
 * @property {string} props.size - The size of the toggle button group.
 * @property {number} props.minWidth - The minimum width of the toggle button group.
 * @property {number} props.minHeight - The minimum height of the toggle button group.
 * @property {number} props.maxWidth - The maximum width of the toggle button group.
 * @property {number} props.maxHeight - The maximum height of the toggle button group.
 * @property {number} props.width - The width of the toggle button group.
 * @property {number} props.height - The height of the toggle button group.
 * @returns {JSX.Element} The rendered ToggleButtonGroupEx component.
 * @example
 * <ToggleButtonGroupEx
 *  id="toggleGroup"
 *  onChange={handleToggleChange}
 *  value={selectedValue}
 *  size="medium"
 *  minWidth={100}
 *  minHeight={50}
 *  maxWidth={200}
 *  maxHeight={100}
 *  width={150}
 *  height={75}
 * >
 *  <ToggleButton value="option1">Option 1</ToggleButton>
 *  <ToggleButton value="option2">Option 2</ToggleButton>
 * </ToggleButtonGroupEx>
 */
function ToggleButtonGroupEx(props) {
    const { id, sx, onChange, value, children, size, minWidth, minHeight, maxWidth, maxHeight } = props;
  
    const getSizeBounds = (groupSize) => {
      switch (groupSize) {
        case 'small':
          return [10, 30];
        case 'medium':
          return [20, 50];
        case 'large':
          return [30, 70];
        default:
          return [10, 70];
      }
    };
  
    const [minSize, maxSize] = getSizeBounds(size);
    const childCount = React.Children.count(children);
    const minWidthFinal = Math.max(
      Math.min(maxWidth ?? minWidth ?? minSize, minWidth ?? maxWidth ?? minSize),
      minSize,
    );
    const maxWidthFinal = Math.max(
      Math.min(maxWidth ?? minWidth ?? maxSize, minWidth ?? maxWidth ?? maxSize),
      maxSize,
    );
    const minHeightFinal = Math.max(
      Math.min(maxHeight ?? minHeight ?? minSize, minHeight ?? maxHeight ?? minSize),
      minSize,
    );
    const maxHeightFinal = Math.max(
      Math.min(maxHeight ?? minHeight ?? maxSize, minHeight ?? maxHeight ?? maxSize),
      maxSize,
    );
  
    const defaultWidth = minWidthFinal + (minWidthFinal % maxHeightFinal) / 2;
    const width = Math.max(minWidthFinal, Math.min(props.width ?? defaultWidth, maxWidthFinal));
  
    const defaultHeight = minWidthFinal + (minWidthFinal % maxHeightFinal) / 2;
    const height = Math.max(minHeightFinal, Math.min(props.height ?? defaultHeight, maxHeightFinal));
  
    const idFinal = id ?? namedId('buttonGroup');
    React.useEffect(() => {
      const firstElement = document.getElementById(idFinal);
      if (firstElement) {
        firstElement.querySelector('.MuiButtonBase-root')?.classList.add('first-element');
      }
    });
    return (
      <ToggleButtonGroupStyled
        id={idFinal}
        onChange={onChange}
        value={value}
        size={size}
        disabled={props.disabled}
        buttonCount={childCount}
        minWidth={minWidthFinal}
        minHeight={minHeightFinal}
        maxWidth={maxWidthFinal}
        maxHeight={maxHeightFinal}
        width={width}
        height={height}
        sx={sx}
      >
        {props.children}
      </ToggleButtonGroupStyled>
    );
  }
  
  ToggleButtonGroupEx.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node),
    height: PropTypes.number,
    maxHeight: PropTypes.number,
    maxWidth: PropTypes.number,
    minHeight: PropTypes.number,
    minWidth: PropTypes.number,
    sx: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
      ),
      PropTypes.func,
      PropTypes.object,
    ]),
    width: PropTypes.number,
  } as any;
  
  export default ToggleButtonGroupEx;