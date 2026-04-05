import * as React from 'react';
import PublicLegalPage from 'docs/src/modules/components/PublicLegalPage';
import { defaultPrivacyPolicy } from 'docs/src/modules/utils/legalBoilerplate';

const PRIVACY_CONTENT = defaultPrivacyPolicy('Stoked UI', new Date('2026-01-01'));

export default function PrivacyPage() {
  return (
    <PublicLegalPage
      type="privacy"
      backHref="/"
      staticContent={PRIVACY_CONTENT}
      staticTitle="Privacy Policy – Stoked UI"
    />
  );
}
