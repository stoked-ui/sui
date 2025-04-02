/**
 * Auto-incrementing Ids hook.
 *
 * Returns a function that generates a new ID each time it is called, with an option
 * to increment the counter by a specified step amount.
 *
 * @param {IncIdProps|string} props - The props for the useIncId hook.
 * @returns {function()} A function that generates a new ID each time it is called.
 */
export default function useIncId(props?: IncIdProps | string): () => string {
  /**
   * Default props for the useIncId hook.
   *
   * @type {Object}
   */
  const defaultProps = {
    /**
     * The length of the generated IDs.
     */
    length: 3,
  };

  if (typeof props === 'string') {
    props = {
      ...defaultProps,
      id: props as string,
    };
  } else {
    props = {
      ...defaultProps,
      ...props as IncIdProps,
    };
  }

  /**
   * Destructure the props to extract the ID, length, and prefix.
   *
   * @type {Object}
   */
  const { id, length, prefix } = props;

  /**
   * Create a new ID by appending a value to the current ID.
   *
   * @param {string} val - The value to append to the ID.
   * @returns {string} A new string representing the updated ID.
   */
  const createId = React.useCallback(
    (val: string) => {
      return `${id}-${val.padStart(length, '0')}`;
    },
    [id, length]
  );

  /**
   * A reference to a counter used to track increments.
   *
   * @type {number}
   */
  const counterRef = React.useRef(0);

  /**
   * Creates a new ID by incrementing the counter and appending the value.
   *
   * @returns {string} A new string representing the updated ID.
   */
  const incrementFunc: IncrementFunc = React.useCallback(
    () => {
      const nextId = String(counterRef.current);
      counterRef.current += 1; // Increment counter
      return createId(nextId);
    },
    [createId]
  ) as IncrementFunc;

  /**
   * Creates a new ID by incrementing the counter and appending the value, with an option to specify the step amount.
   *
   * @param {number} step - The amount to increment the counter by.
   * @returns {string} A new string representing the updated ID.
   */
  incrementFunc.by = React.useCallback(
    (step: number) => {
      const nextId = String(counterRef.current);
      counterRef.current += step; // Increment counter
      return createId(nextId);
    },
    [createId]
  ) as IncrementFunc;

  /**
   * Returns a function that generates a new ID each time it is called, with an option to increment the counter by a specified step amount.
   *
   * @returns {function()} A function that generates a new ID each time it is called.
   */
  return () => {
    const nextId = String(counterRef.current);
    counterRef.current += 1; // Increment counter
    return createId(nextId);
  };
}