function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fill(template: string, productName: string, date: Date): string {
  return template
    .replace(/\{\{productName\}\}/g, productName)
    .replace(/\{\{date\}\}/g, formatDate(date));
}

const PRIVACY_TEMPLATE = `# Privacy Policy

**Last updated: {{date}}**

## 1. Introduction

{{productName}} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you subscribe to and use {{productName}}.

## 2. Information We Collect

**Account Information:** Name, email address, and password when you create an account.

**Billing Information:** Payment details are processed securely through Stripe. We do not store your full payment card number.

**Usage Data:** Information about how you use {{productName}}, including features accessed, session data, and error logs.

**Device and License Data:** Device identifiers used to enforce license activation limits, operating system version, and application version.

## 3. How We Use Your Information

We use your information to:
- Provide and maintain the {{productName}} subscription service
- Process payments and manage your subscription
- Enforce license activation limits
- Send transactional emails (receipts, renewal notices, support responses)
- Diagnose issues and improve the product
- Comply with applicable laws

## 4. Data Sharing

We do not sell your personal information. We share data only with:

**Stripe** — Payment processing and subscription management, subject to Stripe's Privacy Policy.

**Infrastructure providers** — Cloud hosting and storage services, under confidentiality agreements.

**Legal authorities** — When required by law, court order, or to protect our rights and users.

## 5. Data Retention

We retain your account and billing data for the duration of your subscription and for a reasonable period thereafter to comply with legal and tax obligations. You may request deletion of your personal data at any time (see Section 7).

## 6. Security

We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no system is completely secure and we cannot guarantee absolute security.

## 7. Your Rights

Depending on your jurisdiction, you may have the right to:
- Access the personal data we hold about you
- Correct inaccurate data
- Request deletion of your data (note: this will terminate your subscription)
- Export your data in a portable format
- Object to or restrict certain processing

To exercise these rights, contact us through the {{productName}} support channels.

## 8. Cookies

{{productName}} uses essential cookies to maintain your session and authentication state. We do not use third-party advertising or tracking cookies.

## 9. Children's Privacy

{{productName}} is not directed at children under 13. We do not knowingly collect personal information from children under 13.

## 10. Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.

## 11. Contact

For privacy-related inquiries, contact us through the {{productName}} support channels or website.`;

const TERMS_TEMPLATE = `# Terms and Conditions

**Last updated: {{date}}**

## 1. Agreement

By subscribing to {{productName}}, you agree to be bound by these Terms and Conditions. If you do not agree, do not use {{productName}}.

## 2. Subscription

{{productName}} is offered on a subscription basis. Your subscription grants you a personal, non-exclusive, non-transferable license to use {{productName}} during your active subscription period.

## 3. Billing and Payment

Subscriptions are billed in advance on the frequency you select (monthly or annual). Payments are processed by Stripe. By subscribing, you authorize us to charge your payment method for all applicable fees on a recurring basis.

We reserve the right to change pricing with reasonable advance notice. Continued use after a price change constitutes acceptance of the new pricing.

## 4. Free Trial

If a free trial is offered, it begins on your activation date. At the end of the trial period, your subscription will automatically convert to a paid plan unless you cancel before the trial expires.

## 5. Cancellation

You may cancel your subscription at any time through your account settings or by contacting support. Cancellation takes effect at the end of the current billing period. We do not issue refunds for unused time in a billing period unless required by applicable law.

## 6. License

Your active subscription grants you a limited, revocable, non-exclusive, non-transferable license to install and use {{productName}} on the number of devices permitted by your subscription plan.

You may not:
- Sublicense, sell, resell, or redistribute {{productName}}
- Reverse engineer, decompile, or disassemble {{productName}}
- Remove or alter any proprietary notices or labels
- Use {{productName}} to develop a competing product

## 7. Account Responsibilities

You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.

## 8. Acceptable Use

You agree to use {{productName}} only for lawful purposes and in accordance with these Terms. You agree not to use {{productName}} in any way that could damage, disable, or impair our systems.

## 9. Intellectual Property

{{productName}} and all related content, trademarks, and intellectual property are the exclusive property of Stoked Consulting. These Terms do not transfer any ownership or intellectual property rights to you.

## 10. Termination

We reserve the right to suspend or terminate your subscription immediately if you violate these Terms, fail to pay, or engage in fraudulent activity. Upon termination, your license to use {{productName}} expires and you must cease all use.

## 11. Warranty Disclaimer

{{productName}} is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.

## 12. Limitation of Liability

To the maximum extent permitted by applicable law, Stoked Consulting shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total aggregate liability to you shall not exceed the fees you paid in the twelve (12) months preceding the claim.

## 13. Governing Law

These Terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved in the appropriate jurisdiction.

## 14. Changes to Terms

We may update these Terms from time to time. We will notify you of material changes with reasonable advance notice. Continued use of {{productName}} after the effective date of changes constitutes your acceptance.

## 15. Contact

For questions about these Terms, contact us through the {{productName}} support channels or website.`;

export function defaultPrivacyPolicy(productName: string, date = new Date()): string {
  return fill(PRIVACY_TEMPLATE, productName, date);
}

export function defaultTermsAndConditions(productName: string, date = new Date()): string {
  return fill(TERMS_TEMPLATE, productName, date);
}
