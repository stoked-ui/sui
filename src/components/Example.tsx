import React from 'react';

interface ExampleProps {
  title: string;
  count: number;
}

const Example: React.FC<ExampleProps> = ({ title, count }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
};

export default Example;
