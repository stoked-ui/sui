/**
 * Promo Code Management CLI
 *
 * Creates Stripe coupons + promotion codes directly via the Stripe API.
 * Reads STRIPE_SECRET_KEY and ADMIN_SECRET from the environment (or .env).
 *
 * Usage — individual flags:
 *   npx tsx docs/scripts/promo-code.ts \
 *     --name "Summer Sale" \
 *     --code SUMMER50 \
 *     --type percent \
 *     --percent-off 50 \
 *     --duration once
 *
 *   npx tsx docs/scripts/promo-code.ts \
 *     --name "3 Months Free" \
 *     --code LAUNCH3 \
 *     --type free_months \
 *     --free-months 3
 *
 *   npx tsx docs/scripts/promo-code.ts \
 *     --name "$10 Off" \
 *     --code SAVE10 \
 *     --type amount \
 *     --amount-off 10 \
 *     --duration once \
 *     --max-redemptions 100 \
 *     --expires-at 2026-12-31
 *
 * Usage — JSON input:
 *   npx tsx docs/scripts/promo-code.ts --json '{
 *     "name": "Partner Deal",
 *     "code": "PARTNER25",
 *     "type": "percent",
 *     "percentOff": 25,
 *     "duration": "forever",
 *     "productId": "flux"
 *   }'
 *
 * Options:
 *   --name              Display name for the coupon (required)
 *   --code              Promo code string customers enter (required, uppercased)
 *   --type              percent | amount | free_months (required)
 *   --percent-off       Discount percentage, 1–100 (required for --type percent)
 *   --amount-off        Discount in dollars (required for --type amount)
 *   --free-months       Number of free months (required for --type free_months)
 *   --duration          once | forever | repeating (required unless free_months)
 *   --duration-months   Months for repeating duration (required if --duration repeating)
 *   --max-redemptions   Limit total uses
 *   --expires-at        ISO date or YYYY-MM-DD expiry
 *   --product-id        Restrict to a specific product (e.g. "flux")
 *   --first-time-only   Only allow first-time customers (flag, no value)
 *   --min-amount        Minimum purchase amount in dollars
 *   --json              Full payload as a JSON string (overrides all other flags)
 *   --dry-run           Print the payload without calling Stripe
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env from the repo root
const repoRoot = path.resolve(__dirname, '../../');
const envPath = path.join(repoRoot, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import Stripe from 'stripe';

// ---- arg parsing --------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true; // boolean flag
      } else {
        args[key] = next;
        i += 1;
      }
    }
  }
  return args;
}

type PromoPayload = {
  name: string;
  code: string;
  type: 'percent' | 'amount' | 'free_months';
  percentOff?: number;
  amountOff?: number;
  freeMonths?: number;
  duration: 'once' | 'forever' | 'repeating';
  durationInMonths?: number;
  maxRedemptions?: number;
  expiresAt?: string;
  productId?: string;
  firstTimeOnly?: boolean;
  minAmount?: number;
};

function buildPayload(args: Record<string, string | boolean>): PromoPayload {
  if (args.json) {
    return JSON.parse(args.json as string) as PromoPayload;
  }

  const type = args.type as 'percent' | 'amount' | 'free_months';
  if (!type || !['percent', 'amount', 'free_months'].includes(type)) {
    throw new Error('--type must be percent, amount, or free_months');
  }

  const payload: PromoPayload = {
    name: args.name as string,
    code: args.code as string,
    type,
    duration: (args.duration ?? (type === 'free_months' ? 'repeating' : undefined)) as PromoPayload['duration'],
  };

  if (!payload.name) throw new Error('--name is required');
  if (!payload.code) throw new Error('--code is required');

  if (type === 'percent') {
    if (!args['percent-off']) throw new Error('--percent-off is required for type percent');
    payload.percentOff = Number(args['percent-off']);
  } else if (type === 'amount') {
    if (!args['amount-off']) throw new Error('--amount-off is required for type amount');
    payload.amountOff = Number(args['amount-off']);
  } else if (type === 'free_months') {
    if (!args['free-months']) throw new Error('--free-months is required for type free_months');
    payload.freeMonths = Number(args['free-months']);
    payload.duration = 'repeating';
  }

  if (!payload.duration) throw new Error('--duration is required (once | forever | repeating)');

  if (payload.duration === 'repeating' && type !== 'free_months') {
    if (!args['duration-months']) throw new Error('--duration-months is required when --duration repeating');
    payload.durationInMonths = Number(args['duration-months']);
  }

  if (args['max-redemptions']) payload.maxRedemptions = Number(args['max-redemptions']);
  if (args['expires-at']) payload.expiresAt = args['expires-at'] as string;
  if (args['product-id']) payload.productId = args['product-id'] as string;
  if (args['first-time-only']) payload.firstTimeOnly = true;
  if (args['min-amount']) payload.minAmount = Number(args['min-amount']);

  return payload;
}

// ---- Stripe calls -------------------------------------------------------

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    // Print the JSDoc at the top of this file as help text
    const src = fs.readFileSync(__filename, 'utf8');
    const match = src.match(/\/\*\*([\s\S]*?)\*\//);
    if (match) console.log(match[0]);
    process.exit(0);
  }

  let payload: PromoPayload;
  try {
    payload = buildPayload(args);
  } catch (err: unknown) {
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  if (args['dry-run']) {
    console.log('Dry run — payload:');
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set. Add it to .env or export it.');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as never });

  // Build coupon params
  const couponParams: Stripe.CouponCreateParams = {
    name: payload.name,
    duration: payload.type === 'free_months' ? 'repeating' : payload.duration,
  };

  if (payload.type === 'percent' && payload.percentOff !== undefined) {
    couponParams.percent_off = payload.percentOff;
  } else if (payload.type === 'amount' && payload.amountOff !== undefined) {
    couponParams.amount_off = Math.round(payload.amountOff * 100);
    couponParams.currency = 'usd';
  } else if (payload.type === 'free_months' && payload.freeMonths !== undefined) {
    couponParams.percent_off = 100;
    couponParams.duration_in_months = payload.freeMonths;
  }

  if (payload.duration === 'repeating' && payload.durationInMonths && payload.type !== 'free_months') {
    couponParams.duration_in_months = payload.durationInMonths;
  }

  if (payload.maxRedemptions) couponParams.max_redemptions = payload.maxRedemptions;
  if (payload.expiresAt) couponParams.redeem_by = Math.floor(new Date(payload.expiresAt).getTime() / 1000);

  if (payload.productId) {
    // Try direct retrieve first (works when Stripe product ID === internal productId)
    let stripeProductId: string | null = null;
    let stripeProductName: string | null = null;
    try {
      const direct = await stripe.products.retrieve(payload.productId);
      if (!direct.deleted) {
        stripeProductId = direct.id;
        stripeProductName = direct.name;
      }
    } catch {
      // Fall back to metadata search (double-quoted value required by Stripe search)
      const results = await stripe.products.search({
        query: `metadata["productId"]:"${payload.productId}"`,
      });
      if (results.data.length > 0) {
        stripeProductId = results.data[0].id;
        stripeProductName = results.data[0].name;
      }
    }

    if (stripeProductId) {
      couponParams.applies_to = { products: [stripeProductId] };
      console.log(`Restricting to product: ${stripeProductName} (${stripeProductId})`);
    } else {
      console.warn(`Warning: no Stripe product found for '${payload.productId}' — coupon will apply to all products`);
    }
  }

  console.log('Creating coupon...');
  const coupon = await stripe.coupons.create(couponParams);
  console.log(`✓ Coupon created: ${coupon.id}`);

  // Build promo code params
  const promoParams: Stripe.PromotionCodeCreateParams = {
    coupon: coupon.id,
    code: payload.code.toUpperCase(),
  };

  if (payload.maxRedemptions) promoParams.max_redemptions = payload.maxRedemptions;
  if (payload.expiresAt) promoParams.expires_at = Math.floor(new Date(payload.expiresAt).getTime() / 1000);

  if (payload.firstTimeOnly || payload.minAmount) {
    promoParams.restrictions = {};
    if (payload.firstTimeOnly) promoParams.restrictions.first_time_transaction = true;
    if (payload.minAmount) {
      promoParams.restrictions.minimum_amount = Math.round(payload.minAmount * 100);
      promoParams.restrictions.minimum_amount_currency = 'usd';
    }
  }

  console.log('Creating promotion code...');
  const promoCode = await stripe.promotionCodes.create(promoParams);

  const discountLabel =
    payload.type === 'percent' ? `${payload.percentOff}% off`
    : payload.type === 'amount' ? `$${payload.amountOff} off`
    : `${payload.freeMonths} month(s) free`;

  console.log('');
  console.log('✓ Promo code created successfully!');
  console.log('─────────────────────────────────');
  console.log(`  Code:     ${promoCode.code}`);
  console.log(`  Discount: ${discountLabel}`);
  console.log(`  Duration: ${coupon.duration}${coupon.duration_in_months ? ` (${coupon.duration_in_months} months)` : ''}`);
  if (promoCode.max_redemptions) console.log(`  Max uses: ${promoCode.max_redemptions}`);
  if (promoCode.expires_at) console.log(`  Expires:  ${new Date(promoCode.expires_at * 1000).toLocaleDateString()}`);
  console.log(`  Coupon ID:    ${coupon.id}`);
  console.log(`  Promo code ID: ${promoCode.id}`);
}

run().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
