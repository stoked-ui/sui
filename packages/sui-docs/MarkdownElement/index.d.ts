import * as React from 'react';

export interface MarkdownElementProps {
  className?: string;
  renderedMarkdown: string;
}

declare const MarkdownElement: React.ForwardRefExoticComponent<
  MarkdownElementProps & 
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & 
  React.RefAttributes<HTMLDivElement>
>;

export default MarkdownElement; 

