import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { APIGatewayProxyEvent } from "aws-lambda";

import {
  PROMO_CACHE_CONTROL,
  RANDOM_PROMO_CACHE_CONTROL,
  normalizePromoContent,
  resolvePromoRequest,
  selectPromoForRequest,
} from "./promos.ts";

function createEvent(pathId: string, query: Record<string, string | undefined> = {}): APIGatewayProxyEvent {
  return {
    pathParameters: { id: pathId },
    queryStringParameters: query,
  } as APIGatewayProxyEvent;
}

function createEntries(productIds: string[]) {
  return productIds.map((productId) => ({
    productId,
    promo: {
      headerLabel: "Also from Stoked Consulting",
      title: `Promo ${productId}`,
      subtitle: `Subtitle ${productId}`,
      ctaLabel: `CTA ${productId}`,
      ctaUrl: `https://example.com/${productId}`,
    },
  }));
}

describe("api/promos", () => {
  const now = new Date(0);

  it("maps legacy imageUrl data to promoMedia in the API payload", () => {
    assert.deepEqual(normalizePromoContent({
      headerLabel: "Also from Stoked Consulting",
      title: "Promo alpha",
      subtitle: "Subtitle alpha",
      imageUrl: "https://example.com/legacy.png",
      ctaLabel: "CTA alpha",
      ctaUrl: "https://example.com/alpha",
    }), {
      headerLabel: "Also from Stoked Consulting",
      title: "Promo alpha",
      subtitle: "Subtitle alpha",
      promoMedia: "https://example.com/legacy.png",
      ctaLabel: "CTA alpha",
      ctaUrl: "https://example.com/alpha",
    });
  });

  it("selects from the full pool for /random and disables long-lived caching", () => {
    const entries = createEntries(["alpha", "beta", "gamma"]);
    const request = resolvePromoRequest(createEvent("random"));

    const promo = selectPromoForRequest(entries, request.requestedId, now);

    assert.deepEqual(request, {
      requestedId: undefined,
      cacheControl: RANDOM_PROMO_CACHE_CONTROL,
    });
    assert.equal(promo?.title, "Promo alpha");
  });

  it("excludes the caller product for /random?f= when other promos exist", () => {
    const entries = createEntries(["alpha", "beta", "gamma"]);
    const request = resolvePromoRequest(createEvent("random", { f: "beta" }));

    const promo = selectPromoForRequest(entries, request.requestedId, now);

    assert.equal(request.requestedId, "beta");
    assert.notEqual(promo?.title, "Promo beta");
  });

  it("falls back to the full pool when exclusion would empty the random pool", () => {
    const entries = createEntries(["beta"]);
    const request = resolvePromoRequest(createEvent("random", { f: "beta" }));

    const promo = selectPromoForRequest(entries, request.requestedId, now);

    assert.equal(promo?.title, "Promo beta");
  });

  it("keeps the existing /{id} behavior and cache policy", () => {
    const entries = createEntries(["alpha", "beta", "gamma"]);
    const request = resolvePromoRequest(createEvent("beta", { f: "alpha" }));

    const promo = selectPromoForRequest(entries, request.requestedId, now);

    assert.deepEqual(request, {
      requestedId: "beta",
      cacheControl: PROMO_CACHE_CONTROL,
    });
    assert.notEqual(promo?.title, "Promo beta");
  });

  it("returns null when no promos are available", () => {
    const request = resolvePromoRequest(createEvent("random"));

    assert.equal(selectPromoForRequest([], request.requestedId, now), null);
  });
});
