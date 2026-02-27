import Stripe from 'stripe';
import { LicenseStoreError, LicenseProduct } from './licenseStore';

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new LicenseStoreError(500, 'STRIPE_SECRET_KEY is not configured');
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as never,
  });

  return stripeClient;
}

export async function createCheckoutSession(params: {
  productId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}, product: LicenseProduct): Promise<string> {
  const stripe = getStripeClient();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: params.email,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        productId: params.productId,
      },
    });

    if (!session.url) {
      throw new LicenseStoreError(400, 'Stripe did not return a checkout URL');
    }

    return session.url;
  } catch (error: unknown) {
    if (error instanceof LicenseStoreError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Stripe checkout request failed';
    throw new LicenseStoreError(400, `Failed to create checkout session: ${message}`);
  }
}

export function constructStripeWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new LicenseStoreError(500, 'STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid Stripe webhook signature';
    throw new LicenseStoreError(400, `Webhook signature verification failed: ${message}`);
  }
}
