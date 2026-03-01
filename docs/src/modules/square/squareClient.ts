import { SquareClient, SquareEnvironment, WebhooksHelper } from 'square';
import type { CatalogObject, Currency } from 'square/api/types';

export class SquareClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let squareClient: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (squareClient) {
    return squareClient;
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) {
    throw new SquareClientError(500, 'SQUARE_ACCESS_TOKEN is not configured');
  }

  const environment =
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  squareClient = new SquareClient({
    token: accessToken,
    environment,
  });

  return squareClient;
}

export async function createOrUpdateCatalogItem(params: {
  productId: string;
  name: string;
  monthlyPriceCents: number;
  currency: string;
  existingItemId?: string;
  existingVariationId?: string;
}): Promise<{ catalogItemId: string; catalogVariationId: string }> {
  const client = getSquareClient();

  const itemId = params.existingItemId ?? `#temp-${params.productId}`;
  const variationId = params.existingVariationId ?? `#temp-${params.productId}-variation`;
  const currency = params.currency as Currency;

  try {
    const response = await client.catalog.object.upsert({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: 'ITEM',
        id: itemId,
        itemData: {
          name: params.name,
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: variationId,
              itemVariationData: {
                name: 'Monthly',
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: BigInt(params.monthlyPriceCents),
                  currency,
                },
              },
            },
          ],
        },
      },
    });

    const catalogObject = response.catalogObject as (CatalogObject & { type: 'ITEM' }) | undefined;
    if (!catalogObject?.id) {
      throw new SquareClientError(500, 'Square did not return a catalog item ID');
    }

    const variations = catalogObject.itemData?.variations;
    const variation = variations?.[0] as (CatalogObject & { type: 'ITEM_VARIATION' }) | undefined;
    if (!variation?.id) {
      throw new SquareClientError(500, 'Square did not return a catalog variation ID');
    }

    return {
      catalogItemId: catalogObject.id,
      catalogVariationId: variation.id,
    };
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Square catalog upsert failed';
    throw new SquareClientError(500, `Failed to create or update catalog item: ${message}`);
  }
}

export async function createSquareCheckoutLink(params: {
  productId: string;
  email: string;
  catalogVariationId: string;
  priceCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  discountAmountCents?: number;
}): Promise<string> {
  const client = getSquareClient();

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    throw new SquareClientError(500, 'SQUARE_LOCATION_ID is not configured');
  }

  const effectivePriceCents = params.priceCents - (params.discountAmountCents ?? 0);
  const currency = params.currency as Currency;

  try {
    const linkResponse = await client.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: params.productId,
        priceMoney: {
          amount: BigInt(effectivePriceCents),
          currency,
        },
        locationId,
      },
    });

    const url = linkResponse.paymentLink?.url;
    if (!url) {
      throw new SquareClientError(400, 'Square did not return a checkout URL');
    }

    return url;
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Square checkout link creation failed';
    throw new SquareClientError(400, `Failed to create Square checkout link: ${message}`);
  }
}

export async function verifySquareWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  notificationUrl: string,
): Promise<void> {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey) {
    throw new SquareClientError(500, 'SQUARE_WEBHOOK_SIGNATURE_KEY is not configured');
  }

  try {
    const isValid = await WebhooksHelper.verifySignature({
      requestBody: rawBody,
      signatureHeader,
      signatureKey,
      notificationUrl,
    });

    if (!isValid) {
      throw new SquareClientError(400, 'Square webhook signature verification failed');
    }
  } catch (error: unknown) {
    if (error instanceof SquareClientError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Webhook signature verification error';
    throw new SquareClientError(400, `Failed to verify Square webhook signature: ${message}`);
  }
}
