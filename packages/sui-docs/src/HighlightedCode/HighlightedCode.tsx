import * as React from 'react';
import PropTypes from 'prop-types';
import prism from '@stoked-ui/docs-markdown/prism';
import { NoSsr } from '@mui/base/NoSsr';
import MarkdownElement from '../Markdown/MarkdownElement';
import CodeCopyButton from '../components/CodeCopyButton';
import { useCodeCopy } from '../utils/CodeCopy';

const HighlightedCode = React.forwardRef(function HighlightedCode(props: any, ref) {
  const {
    copyButtonHidden = false,
    copyButtonProps,
    code,
    language,
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

HighlightedCode.propTypes = {
  code: PropTypes.string.isRequired,
  component: PropTypes.elementType,
  copyButtonHidden: PropTypes.bool,
  copyButtonProps: PropTypes.object,
  language: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

export default HighlightedCode;
