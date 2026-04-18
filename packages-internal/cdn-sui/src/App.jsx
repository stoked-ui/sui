import React, { useState } from 'react';
import { CdnBrowser } from '@stoked-ui/cdn';
import '@stoked-ui/cdn/styles.css';
import {
  authSessionEndpoint,
  buildAuthLoginUrl,
  buildAuthLogoutUrl,
  cdnName,
  getAuthOrigin,
  publicBaseUrl,
} from './config';

export default function App() {
  const [prefix, setPrefix] = useState('');

  return (
    <CdnBrowser
      title={cdnName}
      apiBaseUrl="/api/cdn"
      publicBaseUrl={publicBaseUrl}
      authEndpoint={authSessionEndpoint}
      loginUrl={(returnTo) => buildAuthLoginUrl(getAuthOrigin(), returnTo)}
      logoutUrl={buildAuthLogoutUrl}
      prefix={prefix}
      onPrefixChange={setPrefix}
    />
  );
}
