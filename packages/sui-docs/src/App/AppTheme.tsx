import * as React from 'react';
import PropTypes from 'prop-types';

interface AppThemeProps {
  children: React.ReactNode,
    Head: React.ElementType
}

function AppTheme({ children, Head }: AppThemeProps) {
  return (
    <React.Fragment>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {children}
    </React.Fragment>
  );
}

AppTheme.propTypes = {
  children: PropTypes.node.isRequired,
  Head: PropTypes.elementType.isRequired,
} as any;

export default AppTheme;
