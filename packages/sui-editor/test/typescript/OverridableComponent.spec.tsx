/**
 * Import necessary modules from React and Material UI.
 */
import * as React from 'react';
import { expectType } from '@mui/types';
import { OverridableComponent, OverrideProps } from '@mui/material/OverridableComponent';

/**
 * Interface for override props of the MyOverrideComponent component.
 */
interface MyOverrideProps {
  /**
   * The class name to be applied to the component.
   */
  className: string;
  /**
   * An optional string property.
   */
  myString?: string;
  /**
   * A callback function with an optional number parameter.
   */
  myCallback?(n: number): void;
}

/**
 * Declare a type alias for MyOverrideComponent, which is the component to be overridden.
 */
declare const MyOverrideComponent: React.ComponentType<MyOverrideProps>;

/**
 * Class component that extends the default MyOverrideComponent.
 */
class MyOverrideClassComponent extends React.Component<MyOverrideProps> {
  /**
   * Render method of the class component, currently returning null.
   */
  render() {
    return null;
  }
}

/**
 * Create a ref-forwarding component to forward an HTMLLegendElement as its own element.
 */
const MyOverrideRefForwardingComponent = React.forwardRef<HTMLLegendElement>((props, ref) => (
  <div ref={ref} />
));

/**
 * Declare a type alias for an incompatible component, which has inconsistent prop types.
 */
declare const MyIncompatibleComponent1: React.ComponentType<{ inconsistentProp?: number }>;

/**
 * Interface for Foo, the OverridableComponent to be demonstrated.
 */
declare const Foo: OverridableComponent<{
  /**
   * Props object with a required numberProp and optional callbackProp.
   */
  props: {
    numberProp: number;
    callbackProp?(b: boolean): void;
    inconsistentProp?: string;
  };
  /**
   * The default component type to be used when no override is provided.
   */
  defaultComponent: React.ComponentType<{
    defaultProp?: boolean;
    defaultCallbackProp?(s: string): void;
  }>;
  /**
   * A key for the class of the component, which can take one of three values.
   */
  classKey: 'root' | 'foo' | 'bar';
}>;

/**
 * Usage examples of Foo with various props and overrides.
 */

// Can provide basic props; callback parameter types will be inferred.
<Foo
  numberProp={3}
  className="foo"
  style={{ backgroundColor: 'red' }}
  classes={{ root: 'x', foo: 'y' }}
  callbackProp={(b) => console.log(b)}
/>

// Can pass props unique to the default component type; callback parameter types
// will be inferred.
<Foo numberProp={3} defaultProp={true} defaultCallbackProp={() => {}} />

<Foo numberProp={3} className="foo" style={{ backgroundColor: 'red' }}
     classes={{ root: 'x', foo: 'y' }} callbackProp={(b) => console.log(b)}
/>

// inconsistent typing of base vs override prop
// but the assumption is that `Foo` intercepts `inconsistentProp` and doesn't forward it
<Foo
  component={MyIncompatibleComponent1} // inconsistent typing of base vs override prop
  numberProp={3}
  inconsistentProp="hi"
/>

<Foo<'div'>
  component="div"
  numberProp={3}
  // event type doesn't match component type
  // @ts-expect-error
  onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.currentTarget.checkValidity()}
/>;

/**
 * Interface for the BarTypeMap, which defines the props and defaultComponent of Bar.
 */
interface BarTypeMap<P = {}, D extends React.ElementType = 'span'> {
  /**
   * Props object with required numberProp and optional callbackProp.
   */
  props: P & {
    numberProp: number;
    callbackProp?(b: boolean): void;
  };
  /**
   * The default component type to be used when no override is provided.
   */
  defaultComponent: D;
}

/**
 * Declare a type alias for Bar, which is the OverridableComponent to be demonstrated.
 */
declare const Bar: OverridableComponent<BarTypeMap>;

/**
 * Type alias for the props of Bar with optional type parameters P and D.
 */
type BarProps<D extends React.ElementType = BarTypeMap['defaultComponent'], P = {}> = OverrideProps<
  BarTypeMap<P, D>,
  D
>;

/**
 * Create a ref-forwarding component to forward an HTMLElement as its own element.
 */
const Header = React.forwardRef<HTMLElement, BarProps>((props, ref) => (
  <Bar ref={ref} component="header" {...props} />
));