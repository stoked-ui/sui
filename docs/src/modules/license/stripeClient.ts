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

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
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
  interval?: 'month' | 'year';
  label?: string;
}): Promise<Stripe.Price> {
  const stripe = getStripeClient();
  return stripe.prices.create({
    product: params.stripeProductId,
    unit_amount: Math.round(params.price * 100), // convert to cents
    currency: params.currency.toLowerCase(),
    nickname: params.label,
    recurring: {
      interval: params.interval || 'year',
    },
    metadata: {
      productId: params.productId,
    },
  });
}

export type CheckoutSessionResult =
  | { mode: 'hosted'; url: string }
  | { mode: 'embedded'; clientSecret: string; sessionId: string };

export async function createCheckoutSession(params: {
  productId: string;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
  stripePriceId?: string;
  uiMode?: 'hosted' | 'embedded';
}, product: LicenseProduct): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const uiMode = params.uiMode ?? 'hosted';
  const selectedPriceId = params.stripePriceId
    || product.subscriptions.find((subscription) => subscription.stripePriceId)?.stripePriceId
    || product.stripePriceId;

  if (!selectedPriceId) {
    throw new LicenseStoreError(400, `Product ${params.productId} is not configured for purchase (missing Stripe Price ID)`);
  }

  try {
    if (uiMode === 'embedded') {
      if (!params.returnUrl) {
        throw new LicenseStoreError(400, 'returnUrl is required for embedded checkout');
      }
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        mode: 'subscription',
        line_items: [{ price: selectedPriceId, quantity: 1 }],
        customer_email: params.email,
        return_url: params.returnUrl,
        allow_promotion_codes: true,
        metadata: {
          productId: params.productId,
          stripePriceId: selectedPriceId,
        },
      } as Parameters<typeof stripe.checkout.sessions.create>[0]);

      if (!session.client_secret) {
        throw new LicenseStoreError(400, 'Stripe did not return a client secret');
      }
      return { mode: 'embedded', clientSecret: session.client_secret, sessionId: session.id };
    }

    // hosted mode
    if (!params.successUrl || !params.cancelUrl) {
      throw new LicenseStoreError(400, 'successUrl and cancelUrl are required for hosted checkout');
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      customer_email: params.email,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        productId: params.productId,
        stripePriceId: selectedPriceId,
      },
    });

    if (!session.url) {
      throw new LicenseStoreError(400, 'Stripe did not return a checkout URL');
    }
    return { mode: 'hosted', url: session.url };
  } catch (error: unknown) {
    if (error instanceof LicenseStoreError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Stripe checkout request failed';
    throw new LicenseStoreError(400, `Failed to create checkout session: ${message}`);
  }
}

export async function createStripeCoupon(params: {
  name: string;
  type: 'percent' | 'amount' | 'free_months';
  percentOff?: number;
  amountOff?: number;
  freeMonths?: number;
  currency?: string;
  duration: 'once' | 'forever' | 'repeating';
  durationInMonths?: number;
  maxRedemptions?: number;
  redeemBy?: number;
  appliesTo?: { products: string[] };
}): Promise<Stripe.Coupon> {
  const stripe = getStripeClient();

  const couponParams: Stripe.CouponCreateParams = {
    name: params.name,
    duration: params.type === 'free_months' ? 'repeating' : params.duration,
  };

  if (params.type === 'percent' && params.percentOff !== undefined) {
    couponParams.percent_off = params.percentOff;
  } else if (params.type === 'amount' && params.amountOff !== undefined) {
    couponParams.amount_off = Math.round(params.amountOff * 100);
    couponParams.currency = (params.currency ?? 'usd').toLowerCase();
  } else if (params.type === 'free_months' && params.freeMonths !== undefined) {
    couponParams.percent_off = 100;
    couponParams.duration = 'repeating';
    couponParams.duration_in_months = params.freeMonths;
  }

  if (params.duration === 'repeating' && params.durationInMonths !== undefined && params.type !== 'free_months') {
    couponParams.duration_in_months = params.durationInMonths;
  }

  if (params.maxRedemptions !== undefined) {
    couponParams.max_redemptions = params.maxRedemptions;
  }
  if (params.redeemBy !== undefined) {
    couponParams.redeem_by = params.redeemBy;
  }
  if (params.appliesTo) {
    couponParams.applies_to = params.appliesTo;
  }

  return stripe.coupons.create(couponParams);
}

export async function createStripePromotionCode(params: {
  couponId: string;
  code: string;
  maxRedemptions?: number;
  expiresAt?: number;
  firstTimeTransaction?: boolean;
  minimumAmount?: number;
  minimumAmountCurrency?: string;
}): Promise<Stripe.PromotionCode> {
  const stripe = getStripeClient();

  const promoParams: Stripe.PromotionCodeCreateParams = {
    coupon: params.couponId,
    code: params.code,
  };

  if (params.maxRedemptions !== undefined) {
    promoParams.max_redemptions = params.maxRedemptions;
  }
  if (params.expiresAt !== undefined) {
    promoParams.expires_at = params.expiresAt;
  }
  if (params.firstTimeTransaction !== undefined || params.minimumAmount !== undefined) {
    promoParams.restrictions = {};
    if (params.firstTimeTransaction !== undefined) {
      promoParams.restrictions.first_time_transaction = params.firstTimeTransaction;
    }
    if (params.minimumAmount !== undefined) {
      promoParams.restrictions.minimum_amount = Math.round(params.minimumAmount * 100);
      promoParams.restrictions.minimum_amount_currency = (params.minimumAmountCurrency ?? 'usd').toLowerCase();
    }
  }

  return stripe.promotionCodes.create(promoParams);
}

export async function deleteStripePromotionCode(idOrCode: string): Promise<{ deleted: boolean; id: string }> {
  const stripe = getStripeClient();

  // If it looks like a promo code string (not a Stripe ID), look it up first
  let promoId = idOrCode;
  if (!idOrCode.startsWith('promo_')) {
    const results = await stripe.promotionCodes.list({ code: idOrCode, limit: 1 });
    if (results.data.length === 0) {
      throw new LicenseStoreError(404, `Promotion code '${idOrCode}' not found`);
    }
    promoId = results.data[0].id;
  }

  // Stripe doesn't support deleting promotion codes — deactivate instead
  await stripe.promotionCodes.update(promoId, { active: false });
  return { deleted: true, id: promoId };
}

export async function listStripePromotionCodes(params: {
  productId?: string;
  limit?: number;
}): Promise<Stripe.PromotionCode[]> {
  const stripe = getStripeClient();
  const listParams: Stripe.PromotionCodeListParams = {
    limit: params.limit ?? 20,
    expand: ['data.coupon'],
  };
  if (params.productId) {
    listParams.active = true;
  }
  const result = await stripe.promotionCodes.list(listParams);
  return result.data;
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

export async function retrieveStripeCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function retrieveStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
  const stripe = getStripeClient();
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    return null;
  }

  return customer as Stripe.Customer;
}

export async function retrieveStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function listStripeSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const stripe = getStripeClient();
  const result = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  });

  return result.data;
}

export async function listStripeInvoices(customerId: string): Promise<Stripe.Invoice[]> {
  const stripe = getStripeClient();
  const result = await stripe.invoices.list({
    customer: customerId,
    limit: 100,
  });

  return result.data;
}

export async function listStripePaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  const stripe = getStripeClient();
  const result = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
    limit: 100,
  });

  return result.data;
}

export async function createStripeBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  if (!session.url) {
    throw new LicenseStoreError(400, 'Stripe did not return a billing portal URL');
  }

  return session.url;
}
