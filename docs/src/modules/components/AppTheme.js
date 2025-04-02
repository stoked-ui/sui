import * as React from 'react';
import PropTypes from 'prop-types';
import Head from 'docs/src/modules/components/Head';

export default function AppTheme(props) {
  const { children } = props;

  return (
    <React.Fragment>
      <Head>
      </Head>
      {children}
    </React.Fragment>
  );
}

AppTheme.propTypes = {
  children: PropTypes.node.isRequired,
};

