import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';
import {
  createStripeBillingPortalSession,
  isStripeConfigured,
  listStripeInvoices,
  listStripePaymentMethods,
  listStripeSubscriptions,
  retrieveStripeCustomer,
  retrieveStripeSubscription,
} from 'docs/src/modules/license/stripeClient';

type NotificationPreferencesDoc = {
  ownedProductUpdates?: boolean;
  otherProductUpdates?: boolean;
};

type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  notificationPreferences?: NotificationPreferencesDoc;
};

type SubscriberDoc = {
  active?: boolean;
  notificationPreferences?: NotificationPreferencesDoc;
};

type ProductFeature = {
  id?: string;
  name: string;
  description?: string;
};

type ProductDoc = {
  _id?: ObjectId;
  productId: string;
  name?: string;
  fullName?: string;
  description?: string;
  features?: ProductFeature[];
  hideProductFeatures?: boolean;
  price?: number;
  currency?: string;
  url?: string;
};

type LicenseStatus = 'pending' | 'active' | 'expired' | 'revoked';

type ActivationRecord = {
  hardwareId: string;
  machineName: string | null;
  activatedAt: Date;
};

type LicenseDoc = {
  _id?: ObjectId;
  key: string;
  email: string;
  productId: string;
  hardwareId?: string | null;
  machineName?: string | null;
  activations?: ActivationRecord[];
  status: LicenseStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  gracePeriodDays?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  maxActivations?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface AccountNotificationPreferences {
  ownedProductUpdates: boolean;
  otherProductUpdates: boolean;
}

export interface AccountSettings {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  notificationPreferences: AccountNotificationPreferences;
}

export interface AccountLicense {
  id: string;
  key: string;
  productId: string;
  productName: string;
  productDescription: string;
  productUrl?: string;
  status: LicenseStatus;
  subscriptionStatus: string;
  expiresAt: string | null;
  activatedAt: string | null;
  renewsAt: string | null;
  timeLeftDays: number | null;
  machineName: string | null;
  supportLabel: string;
  features: ProductFeature[];
  activations: number;
  maxActivations: number;
}

export interface AccountBillingInvoice {
  id: string;
  number: string | null;
  status: string;
  description: string;
  amountDue: number;
  amountPaid: number;
  amountRemaining: number;
  currency: string;
  dueDate: string | null;
  createdAt: string | null;
  paidAt: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

export interface AccountPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface AccountBillingSummary {
  customerId: string | null;
  billingEmail: string | null;
  hasBillingPortal: boolean;
  activeSubscriptions: number;
  amountDue: number;
  invoicesDue: AccountBillingInvoice[];
  paymentHistory: AccountBillingInvoice[];
  paymentMethods: AccountPaymentMethod[];
}

function ensureObjectId(value: string): ObjectId {
  if (!ObjectId.isValid(value)) {
    throw new Error('Invalid user ID');
  }

  return new ObjectId(value);
}

function toIsoString(value?: Date | number | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value * 1000).toISOString();
}

function getDefaultNotificationPreferences(
  userDoc?: UserDoc | null,
  subscriberDoc?: SubscriberDoc | null,
): AccountNotificationPreferences {
  if (userDoc?.notificationPreferences) {
    return {
      ownedProductUpdates: Boolean(userDoc.notificationPreferences.ownedProductUpdates),
      otherProductUpdates: Boolean(userDoc.notificationPreferences.otherProductUpdates),
    };
  }

  if (subscriberDoc?.notificationPreferences) {
    return {
      ownedProductUpdates: Boolean(subscriberDoc.notificationPreferences.ownedProductUpdates),
      otherProductUpdates: Boolean(subscriberDoc.notificationPreferences.otherProductUpdates),
    };
  }

  if (subscriberDoc?.active !== false && subscriberDoc) {
    return {
      ownedProductUpdates: true,
      otherProductUpdates: true,
    };
  }

  return {
    ownedProductUpdates: false,
    otherProductUpdates: false,
  };
}

function getActivationCount(license: LicenseDoc): number {
  if (license.activations && license.activations.length > 0) {
    return license.activations.length;
  }

  return license.hardwareId ? 1 : 0;
}

function getTimeLeftDays(expiresAt?: Date): number | null {
  if (!expiresAt) {
    return null;
  }

  const diffMs = expiresAt.getTime() - Date.now();
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

function buildSupportLabel(status: LicenseStatus, expiresAt?: Date): string {
  if (!expiresAt) {
    return status === 'active' || status === 'pending' ? 'Included with your plan' : 'Not active';
  }

  if (status === 'active' || status === 'pending') {
    return `Included through ${expiresAt.toLocaleDateString()}`;
  }

  return `Expired on ${expiresAt.toLocaleDateString()}`;
}

function mapBillingInvoice(invoice: {
  id: string;
  number: string | null;
  status: string | null;
  description?: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  due_date: number | null;
  created: number;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  status_transitions?: {
    paid_at?: number | null;
  };
}): AccountBillingInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status || 'unknown',
    description: invoice.description || 'Subscription invoice',
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    amountRemaining: invoice.amount_remaining,
    currency: invoice.currency,
    dueDate: toIsoString(invoice.due_date),
    createdAt: toIsoString(invoice.created),
    paidAt: toIsoString(invoice.status_transitions?.paid_at || null),
    hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    invoicePdf: invoice.invoice_pdf || null,
  };
}

async function getUserById(userId: string): Promise<UserDoc | null> {
  const db = await getDb();
  return db.collection<UserDoc>('users').findOne(
    { _id: ensureObjectId(userId) },
    {
      projection: {
        email: 1,
        name: 1,
        role: 1,
        avatarUrl: 1,
        notificationPreferences: 1,
      },
    },
  );
}

export async function getAccountSettings(userId: string): Promise<AccountSettings> {
  const db = await getDb();
  const user = await getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const subscriber = await db.collection<SubscriberDoc>('subscribers').findOne({ email: user.email.toLowerCase() });

  return {
    id: user['_id'].toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    notificationPreferences: getDefaultNotificationPreferences(user, subscriber),
  };
}

export async function updateAccountSettings(
  userId: string,
  notificationPreferences: AccountNotificationPreferences,
): Promise<AccountSettings> {
  const db = await getDb();
  const user = await getUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const nextPreferences = {
    ownedProductUpdates: Boolean(notificationPreferences.ownedProductUpdates),
    otherProductUpdates: Boolean(notificationPreferences.otherProductUpdates),
  };
  const now = new Date();

  await db.collection<UserDoc>('users').updateOne(
    { _id: ensureObjectId(userId) },
    {
      $set: {
        notificationPreferences: nextPreferences,
        updatedAt: now,
      },
    },
  );

  const notificationsEnabled = nextPreferences.ownedProductUpdates || nextPreferences.otherProductUpdates;
  await db.collection('subscribers').updateOne(
    { email: user.email.toLowerCase() },
    {
      $set: {
        email: user.email.toLowerCase(),
        userId: user['_id'],
        active: notificationsEnabled,
        notificationPreferences: nextPreferences,
        updatedAt: now,
        unsubscribedAt: notificationsEnabled ? null : now,
        source: 'account-settings',
      },
      $setOnInsert: {
        subscribedAt: now,
      },
    },
    { upsert: true },
  );

  return {
    id: user['_id'].toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    notificationPreferences: nextPreferences,
  };
}

export async function getAccountLicenses(email: string): Promise<AccountLicense[]> {
  const db = await getDb();
  const licenses = await db.collection<LicenseDoc>('licenses')
    .find({ email: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .toArray();

  if (licenses.length === 0) {
    return [];
  }

  const productIds = Array.from(new Set(licenses.map((license) => license.productId)));
  const products = await db.collection<ProductDoc>('products')
    .find({ productId: { $in: productIds } })
    .toArray();
  const productMap = new Map(products.map((product) => [product.productId, product]));

  const subscriptionStatusMap = new Map<string, { status: string; renewsAt: string | null }>();

  if (isStripeConfigured()) {
    await Promise.all(
      licenses.map(async (license) => {
        if (!license.stripeSubscriptionId || subscriptionStatusMap.has(license.stripeSubscriptionId)) {
          return;
        }

        try {
          const subscription = await retrieveStripeSubscription(license.stripeSubscriptionId);
          subscriptionStatusMap.set(license.stripeSubscriptionId, {
            status: subscription.status,
            renewsAt: toIsoString(subscription.current_period_end || null),
          });
        } catch {
          subscriptionStatusMap.set(license.stripeSubscriptionId, {
            status: license.status,
            renewsAt: null,
          });
        }
      }),
    );
  }

  return licenses.map((license) => {
    const product = productMap.get(license.productId);
    const stripeSubscription = license.stripeSubscriptionId
      ? subscriptionStatusMap.get(license.stripeSubscriptionId)
      : null;
    const expiresAt = license.expiresAt ? new Date(license.expiresAt) : undefined;

    return {
      id: license['_id']?.toString() || `${license.productId}-${license.key}`,
      key: license.key,
      productId: license.productId,
      productName: product?.fullName || product?.name || license.productId,
      productDescription: product?.description || '',
      productUrl: product?.url,
      status: license.status,
      subscriptionStatus: stripeSubscription?.status || license.status,
      expiresAt: toIsoString(expiresAt || null),
      activatedAt: toIsoString(license.activatedAt || null),
      renewsAt: stripeSubscription?.renewsAt || null,
      timeLeftDays: getTimeLeftDays(expiresAt),
      machineName: license.machineName || null,
      supportLabel: buildSupportLabel(license.status, expiresAt),
      features: product?.hideProductFeatures ? [] : (product?.features || []),
      activations: getActivationCount(license),
      maxActivations: license.maxActivations || 1,
    };
  });
}

export async function getAccountBillingSummary(email: string): Promise<AccountBillingSummary> {
  const db = await getDb();
  const licenses = await db.collection<LicenseDoc>('licenses')
    .find({ email: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .toArray();

  const customerId = licenses.find((license) => license.stripeCustomerId)?.stripeCustomerId || null;
  const fallbackActiveSubscriptions = licenses.filter((license) => (
    license.status === 'active' || license.status === 'pending'
  )).length;

  if (!customerId || !isStripeConfigured()) {
    return {
      customerId,
      billingEmail: email,
      hasBillingPortal: false,
      activeSubscriptions: fallbackActiveSubscriptions,
      amountDue: 0,
      invoicesDue: [],
      paymentHistory: [],
      paymentMethods: [],
    };
  }

  const [customer, subscriptions, invoices, paymentMethods] = await Promise.all([
    retrieveStripeCustomer(customerId),
    listStripeSubscriptions(customerId),
    listStripeInvoices(customerId),
    listStripePaymentMethods(customerId),
  ]);

  const defaultPaymentMethodValue = customer?.invoice_settings?.default_payment_method;
  const defaultPaymentMethodId = typeof defaultPaymentMethodValue === 'string'
    ? defaultPaymentMethodValue
    : defaultPaymentMethodValue?.id;

  const mappedInvoices = invoices.map(mapBillingInvoice);
  const invoicesDue = mappedInvoices.filter((invoice) => (
    (invoice.status === 'open' || invoice.status === 'draft' || invoice.status === 'uncollectible')
      && invoice.amountRemaining > 0
  ));
  const paymentHistory = mappedInvoices.filter((invoice) => (
    invoice.status === 'paid' || invoice.amountPaid > 0
  ));

  return {
    customerId,
    billingEmail: customer?.email || email,
    hasBillingPortal: true,
    activeSubscriptions: subscriptions.filter((subscription) => (
      subscription.status === 'active'
      || subscription.status === 'trialing'
      || subscription.status === 'past_due'
      || subscription.status === 'unpaid'
    )).length,
    amountDue: invoicesDue.reduce((sum, invoice) => sum + invoice.amountRemaining, 0),
    invoicesDue,
    paymentHistory,
    paymentMethods: paymentMethods
      .filter((paymentMethod) => Boolean(paymentMethod.card?.last4))
      .map((paymentMethod) => ({
        id: paymentMethod.id,
        brand: paymentMethod.card?.brand || 'card',
        last4: paymentMethod.card?.last4 || '0000',
        expMonth: paymentMethod.card?.exp_month || 0,
        expYear: paymentMethod.card?.exp_year || 0,
        isDefault: paymentMethod.id === defaultPaymentMethodId,
      })),
  };
}

export async function createAccountBillingPortalUrl(email: string, returnUrl: string): Promise<string> {
  const db = await getDb();
  const license = await db.collection<LicenseDoc>('licenses').findOne(
    { email: email.toLowerCase(), stripeCustomerId: { $exists: true, $ne: '' } },
    { sort: { createdAt: -1 } },
  );

  if (!license?.stripeCustomerId) {
    throw new Error('No Stripe customer found for this account');
  }

  if (!isStripeConfigured()) {
    throw new Error('Stripe billing is not configured');
  }

  return createStripeBillingPortalSession({
    customerId: license.stripeCustomerId,
    returnUrl,
  });
}
