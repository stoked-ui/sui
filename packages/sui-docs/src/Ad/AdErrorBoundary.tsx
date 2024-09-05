import * as React from 'react';
import PropTypes from 'prop-types';

interface AdErrorBoundaryProps {
  children: React.ReactNode;
  eventLabel?: string;
}

const AdErrorBoundary: React.FC<AdErrorBoundaryProps> = ({ children, eventLabel }) => {
  const [didError, setDidError] = React.useState(false);

  React.useEffect(() => {
    if (didError) {
      const eventLabelStr = String(eventLabel);
      window.gtag('event', 'ad', {
        eventAction: 'crash',
        eventLabel: eventLabelStr,
      });
    }
  }, [didError, eventLabel]);

  const getDerivedStateFromError = () => {
    setDidError(true);
  };

  if (didError) {
    return null;
  }

  return <>{children}</>;
};

AdErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  eventLabel: PropTypes.string,
};

export default AdErrorBoundary;
