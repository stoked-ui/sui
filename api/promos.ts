import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export interface PromoContent {
  headerLabel: string;
  title: string;
  subtitle: string;
  /** Fully-qualified HTTPS URL to promo media, or omit for no media. */
  promoMedia?: string;
  ctaLabel: string;
  ctaUrl: string;
}

type PromoContentSource = Omit<PromoContent, "promoMedia"> & {
  imageUrl?: string;
};

type PromoDocument = {
  live?: boolean;
  productId?: string;
  promo?: Partial<PromoContentSource> | null;
};

type PromoEntry = {
  productId: string;
  promo: PromoContent;
};

const DEFAULT_HEADER_LABEL = "Also from Stoked Consulting";
const PROMO_ROTATION_MS = 1000 * 60 * 60;
export const PROMO_CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";
export const RANDOM_PROMO_CACHE_CONTROL = "no-store";

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePromoContent(input: Partial<PromoContentSource> | null | undefined): PromoContent | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const headerLabel = readString(input.headerLabel) || DEFAULT_HEADER_LABEL;
  const title = readString(input.title);
  const subtitle = readString(input.subtitle);
  const promoMedia = readString(input.promoMedia) || readString(input.imageUrl);
  const ctaLabel = readString(input.ctaLabel);
  const ctaUrl = readString(input.ctaUrl);

  if (!title || !subtitle || !ctaLabel || !ctaUrl) {
    return null;
  }

  return {
    headerLabel,
    title,
    subtitle,
    ...(promoMedia ? { promoMedia } : {}),
    ctaLabel,
    ctaUrl,
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function selectPromoForRequest(entries: PromoEntry[], requestedId?: string, now = new Date()): PromoContent | null {
  if (entries.length === 0) {
    return null;
  }

  const normalizedRequestedId = readString(requestedId);
  const nonSelfEntries = normalizedRequestedId
    ? entries.filter((entry) => entry.productId !== normalizedRequestedId)
    : entries;
  const pool = nonSelfEntries.length > 0 ? nonSelfEntries : entries;
  const sortedPool = [...pool].sort((left, right) => left.productId.localeCompare(right.productId));

  // Stateless hourly rotation keeps promos moving without persisting view state.
  const rotationSlot = Math.floor(now.getTime() / PROMO_ROTATION_MS);
  const requestedOffset = normalizedRequestedId ? hashString(normalizedRequestedId) : 0;
  const index = (rotationSlot + requestedOffset) % sortedPool.length;

  return sortedPool[index]?.promo ?? null;
}

export function isRandomPromoRequest(pathId?: string): boolean {
  return readString(pathId).toLowerCase() === "random";
}

export function resolvePromoRequest(event: APIGatewayProxyEvent): {
  requestedId?: string;
  cacheControl: string;
} {
  if (isRandomPromoRequest(event.pathParameters?.id)) {
    return {
      requestedId: readString(event.queryStringParameters?.f) || undefined,
      cacheControl: RANDOM_PROMO_CACHE_CONTROL,
    };
  }

  return {
    requestedId: readString(event.pathParameters?.id) || undefined,
    cacheControl: PROMO_CACHE_CONTROL,
  };
}

function json(statusCode: number, body: unknown, cacheControl = PROMO_CACHE_CONTROL): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": cacheControl,
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const { default: dbClient } = await import("./lib/mongodb");
    const db = (await dbClient).db();
    const promoDocuments = await db
      .collection<PromoDocument>("products")
      .find(
        { live: true, promo: { $exists: true, $ne: null } },
        { projection: { _id: 0, productId: 1, promo: 1 } },
      )
      .toArray();

    const entries = promoDocuments.reduce<PromoEntry[]>((result, document) => {
      const productId = readString(document.productId);
      const promo = normalizePromoContent(document.promo);

      if (!productId || !promo) {
        return result;
      }

      result.push({ productId, promo });
      return result;
    }, []);

    const { requestedId, cacheControl } = resolvePromoRequest(event);
    const promo = selectPromoForRequest(entries, requestedId);

    if (!promo) {
      return json(404, { message: "Promo not found" }, cacheControl);
    }

    return json(200, promo, cacheControl);
  } catch (error) {
    console.error("Failed to load promos", error);
    return json(500, { message: "Failed to load promos" });
  }
}
