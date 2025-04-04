/**
 * Extends the @mui/material/styles module to add a custom mixin.
 *
 * @module '@mui/material/styles'
 */

declare module '@mui/material/styles' {
  /**
   * Interface for Mixins options in Material-UI's createTheme function.
   */
  interface MixinsOptions {
    /**
     * Custom mixin interpolation type.
     *
     * @type {Interpolation<{}>}
     */
    customMixin: Interpolation<{}>;
  }

  /**
   * Interface for extended Mixins.
   */
  interface Mixins extends MixinsOptions {}
}

/**
 * Creates a Material-UI theme with a custom mixin.
 *
 * @param options Theme creation options, including mixins.
 * @returns A Material-UI theme object.
 */
function createTheme(options: MixinsOptions): any {
  return { mixins: options };
}

// ensure MixinsOptions work
const theme = createTheme({ mixins: { customMixin: { paddingLeft: 2 } } });

/**
 * Custom styled component using the custom mixin.
 *
 * @component Example
 */

/**
 * Styled component extending div with custom mixin interpolation.
 *
 * @param props Component props.
 */
interface ExampleProps {
  /**
   * Props for the styled component.
   */
  theme?: any;
}

/**
 * Material-UI component that uses the custom mixin interpolation.
 *
 * @class Example
 * @extends {StyledComponent}
 */
class Example extends React.Component<ExampleProps> {
  constructor(props: ExampleProps) {
    super(props);
    // No instance-specific code.
  }

  /**
   * Renders the styled component.
   *
   * @return The JSX element for the component.
   */
  render(): JSX.Element {
    return <div>{this.props.theme.mixins.customMixin}</div>;
  }
}

export default Example;