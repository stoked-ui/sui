import * as React from 'react';
import AppTheme from '@stoked-ui/docs/App/AppTheme';
import Paperbase from 'docs/src/pages/premium-themes/paperbase/Paperbase';

export default function Page() {
  return (
    <AppTheme
      title="Paperbase theme - SUI"
      description={`A page that mimics Firebase.
        This item includes theming using the theme provider component.`}
    >
      <Paperbase />
    </AppTheme>
  );
}
