/**
 * File icon container component for displaying file icons.
 *
 * @param {object} props - The props for the FileIconContainer component
 * @property {string} props.name - The name of the file icon container
 * @property {string} props.slot - The slot for the icon container
 * @property {function} props.overridesResolver - The resolver function for overrides
 * @property {function} props.shouldForwardProp - The function to determine if a prop should be forwarded
 *
 * @returns {JSX.Element} React component representing the file icon container
 *
 * @example
 * <FileIconContainer name="file" slot="icon" overridesResolver={(props, styles) => styles.iconContainer} shouldForwardProp={(prop) => shouldForwardProp(prop) && prop !== 'iconName'} />
 */
export const FileIconContainer = styled('div', {
  name: 'MuiFile',
  slot: 'IconContainer',
  overridesResolver: (props, styles) => styles.iconContainer,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'iconName'
})({
  width: 16,
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'center',
  '& svg': {
    fontSize: 18,
  },
});