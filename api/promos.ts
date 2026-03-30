import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export interface PromoContent {
  headerLabel: string;
  title: string;
  subtitle: string;
  /** Fully-qualified HTTPS URL to a promo image, or omit for no image. */
  imageUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
}

type PromoDocument = {
  live?: boolean;
  productId?: string;
  promo?: Partial<PromoContent> | null;
};

type PromoEntry = {
  productId: string;
  promo: PromoContent;
};

const DEFAULT_HEADER_LABEL = "Also from Stoked Consulting";
const PROMO_ROTATION_MS = 1000 * 60 * 60;

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizePromoContent(input: Partial<PromoContent> | null | undefined): PromoContent | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const headerLabel = readString(input.headerLabel) || DEFAULT_HEADER_LABEL;
  const title = readString(input.title);
  const subtitle = readString(input.subtitle);
  const imageUrl = readString(input.imageUrl);
  const ctaLabel = readString(input.ctaLabel);
  const ctaUrl = readString(input.ctaUrl);

  if (!title || !subtitle || !ctaLabel || !ctaUrl) {
    return null;
  }

  return {
    headerLabel,
    title,
    subtitle,
    ...(imageUrl ? { imageUrl } : {}),
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

function json(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
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

    const promo = selectPromoForRequest(entries, event.pathParameters?.id);

    if (!promo) {
      return json(404, { message: "Promo not found" });
    }

    return json(200, promo);
  } catch (error) {
    console.error("Failed to load promos", error);
    return json(500, { message: "Failed to load promos" });
  }
}
