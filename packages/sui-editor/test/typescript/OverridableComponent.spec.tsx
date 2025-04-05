/**
 * @typedef MyOverrideProps
 * @property {string} className - The class name for the component
 * @property {string} [myString] - An optional string property
 * @property {function} [myCallback] - An optional callback function that takes a number parameter
 */

/**
 * @typedef {React.ComponentType<MyOverrideProps>} MyOverrideComponent
 */

/**
 * Class representing a component that extends React.Component.
 */
class MyOverrideClassComponent extends React.Component {
  /**
   * Render method for the component.
   * @returns {JSX.Element} The rendered JSX element
   */
  render() {
    return null;
  }
}

/**
 * Component that forwards a ref to a HTMLLegendElement.
 */
const MyOverrideRefForwardingComponent = React.forwardRef<HTMLLegendElement>((props, ref) => (
  <div ref={ref} />
));

/**
 * Component that may have inconsistent props.
 */
declare const MyIncompatibleComponent1: React.ComponentType<{ inconsistentProp?: number }>;

/**
 * Component that accepts various props and component types.
 */
declare const Foo: OverridableComponent<{
  props: {
    numberProp: number;
    callbackProp?(b: boolean): void;
    inconsistentProp?: string;
  };
  defaultComponent: React.ComponentType<{
    defaultProp?: boolean;
    defaultCallbackProp?(s: string): void;
  }>;
  classKey: 'root' | 'foo' | 'bar';
}>;

// Examples of using the Foo component with different props and component types.

// ... (Examples omitted for brevity)

/**
 * Component that accepts polymorphic props and component types.
 */
declare const Bar: OverridableComponent<BarTypeMap>;

/**
 * Props for the Bar component.
 * @template D - The default component type
 * @template P - Additional props
 * @type {BarProps}
 */
type BarProps<D extends React.ElementType = BarTypeMap['defaultComponent'], P = {}> = OverrideProps<
  BarTypeMap<P, D>,
  D
>;

/**
 * Header component that extends the Bar component.
 */
const Header = React.forwardRef<HTMLElement, BarProps>((props, ref) => (
  <Bar ref={ref} component="header" {...props} />
));
