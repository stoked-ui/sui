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

export async function createStripeProduct(params: {
  productId: string;
  name: string;
  description?: string;
}): Promise<Stripe.Product> {
  const stripe = getStripeClient();
  return stripe.products.create({
    id: params.productId,
    name: params.name,
    description: params.description,
    metadata: {
      productId: params.productId,
    },
  });
}

export async function createStripePrice(params: {
  productId: string;
  stripeProductId: string;
  price: number;
  currency: string;
}): Promise<Stripe.Price> {
  const stripe = getStripeClient();
  return stripe.prices.create({
    product: params.stripeProductId,
    unit_amount: Math.round(params.price * 100), // convert to cents
    currency: params.currency.toLowerCase(),
    recurring: {
      interval: 'year',
    },
    metadata: {
      productId: params.productId,
    },
  });
}

export async function createCheckoutSession(params: {
  productId: string;
  email: string;
  successUrl: string;
  cancelUrl: string;
}, product: LicenseProduct): Promise<string> {
  const stripe = getStripeClient();

  if (!product.stripePriceId) {
    throw new LicenseStoreError(400, `Product ${params.productId} is not configured for purchase (missing Stripe Price ID)`);
  }

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
