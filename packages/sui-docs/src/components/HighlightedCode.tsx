import * as React from 'react';
import prism from '@stoked-ui/docs-markdown/prism';
import { NoSsr } from '@mui/base/NoSsr';
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";
import MarkdownElement from './MarkdownElement';
import CodeCopyButton from './CodeCopyButton';
import { useCodeCopy } from './CodeCopy';

export interface HighlightedCodeProps {
  code: string,
  component?: React.ElementType,
  copyButtonHidden?: boolean,
  copyButtonProps?: Object,
  language?: string,
  sx?: SxProps<Theme>,
}

const HighlightedCode = React.forwardRef(function HighlightedCode(props: HighlightedCodeProps, ref) {
  const {
    copyButtonHidden = false,
    copyButtonProps,
    code,
    language= 'en',
    component: Component = MarkdownElement,
    ...other
  } = props;
  const renderedCode = React.useMemo(() => {
    return prism(code.trim(), language);
  }, [code, language]);
  const handlers = useCodeCopy();

  return (
    <Component ref={ref} {...other}>
      <div className="MuiCode-root" {...handlers}>
        {copyButtonHidden ? null : (
          <NoSsr>
            <CodeCopyButton code={code} {...copyButtonProps} />
          </NoSsr>
        )}
        <pre>
          <code
            className={`language-${language}`}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: renderedCode }}
          />
        </pre>
      </div>
    </Component>
  );
});


export default HighlightedCode;
