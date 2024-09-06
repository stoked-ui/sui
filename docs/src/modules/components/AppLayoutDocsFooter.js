/* eslint-disable no-restricted-globals */
import * as React from 'react';
import PropTypes from 'prop-types';
export default function AppLayoutDocsFooter(props) {
  const { tableOfContents = [], location } = props;
console.log('test');
  return (
    <React.Fragment>
    </React.Fragment>
  );
}

AppLayoutDocsFooter.propTypes = {
  location: PropTypes.string.isRequired,
  tableOfContents: PropTypes.array,
};
