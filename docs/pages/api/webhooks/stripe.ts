import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { constructStripeWebhookEvent } from 'docs/src/modules/license/stripeClient';
import {
  createLicense,
  findLicenseBySubscriptionId,
  renewLicenseBySubscriptionId,
} from 'docs/src/modules/license/licenseStore';
import { handleLicenseApiError } from 'docs/src/modules/license/licenseApiUtils';

export const config = {
  api: {
    bodyParser: false,
  },
};

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const sesFromEmail = process.env.SES_FROM_EMAIL || 'noreply@stoked-ui.com';

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

async function sendLicenseEmail(toEmail: string, licenseKey: string, productId: string, maxActivations: number): Promise<void> {
  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: sesFromEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: `Your ${productId} License Key`,
          },
          Body: {
            Text: {
              Data: [
                'Thank you for your purchase!',
                '',
                `Your license key: ${licenseKey}`,
                '',
                `To activate, enter this key in the ${productId} application settings.`,
                '',
                `This key can be activated on up to ${maxActivations} devices simultaneously.`,
                'To transfer it to a new device, deactivate one of your current devices first.',
                '',
                'If you have any questions, contact support@stoked-ui.com',
              ].join('\n'),
            },
          },
        },
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown SES error';
    console.error(`[stripe-webhook] Failed to send license email to ${toEmail}: ${message}`);
  }
}

async function handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = typeof session.customer === 'string' ? session.customer : '';
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : '';
  const email = session.customer_email || '';
  const productId = session.metadata?.productId || '';

  if (!subscriptionId) {
    console.warn('[stripe-webhook] checkout.session.completed missing subscription ID');
    return;
  }

  if (!productId) {
    console.warn('[stripe-webhook] checkout.session.completed missing productId metadata');
    return;
  }

  const existing = await findLicenseBySubscriptionId(subscriptionId);
  if (existing) {
    return;
  }

  const license = await createLicense({
    email,
    productId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  });

  if (email) {
    await sendLicenseEmail(email, license.key, productId, license.maxActivations || 1);
  }
}

async function handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : '';

  if (!subscriptionId) {
    return;
  }

  // Only process renewal payments, not the initial checkout payment.
  if (invoice.billing_reason !== 'subscription_cycle') {
    return;
  }

  await renewLicenseBySubscriptionId(subscriptionId);
}

async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  if (!subscriptionId) {
    return;
  }

  const license = await findLicenseBySubscriptionId(subscriptionId);
  if (license) {
    console.info(
      `[stripe-webhook] Subscription ${subscriptionId} cancelled; license ${license.key} remains valid until ${license.expiresAt?.toISOString()}`,
    );
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ message: 'Missing stripe-signature header' });
  }

  try {
    const rawBody = await readRawBody(req);
    const event = constructStripeWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      default:
        // No-op for other events.
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error: unknown) {
    return handleLicenseApiError(res, error, 'Failed to process Stripe webhook');
  }
}
