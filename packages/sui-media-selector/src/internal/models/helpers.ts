import React, { useState } from 'react';

/**
 * Functional component that renders a button with a click counter.
 * @description ButtonWithCounter component displays a button that increments a counter on each click.
 * @param {Object} props - The props of the component.
 * @property {string} label - The text displayed on the button.
 * @returns {JSX.Element} React component
 * @example
 * <ButtonWithCounter label="Click Me" />
 */
const ButtonWithCounter = (props) => {
    const [count, setCount] = useState(0);

    /**
     * Function to handle the button click event.
     * @param {React.MouseEvent} event - The click event object.
     */
    const handleClick = (event) => {
        setCount(count + 1);
    };

    return (
        <button onClick={handleClick}>{props.label} - {count}</button>
    );
};

export default ButtonWithCounter;