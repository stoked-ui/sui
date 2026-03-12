# Orchestration Summary

## Product Management System — Square Pricing, Promos & Enhanced Fields

**Created:** 2026-02-28
**GitHub Project:** https://github.com/orgs/stokedconsulting/projects/100

---

## PRD

`./projects/product-mgmt-square-pricing/prd.md`

- 4 phases, 20 work items, 68 acceptance criteria (all validated)

---

## GitHub Issues

### Master Phase Issues

| Phase | Title | Issue |
|-------|-------|-------|
| 1 | Schema & API Foundation | #344 |
| 2 | Square Pricing Integration | #345 |
| 3 | Promo Code System | #346 |
| 4 | UI Updates | #347 |

### Work Item Issues

| ID | Title | Issue |
|----|-------|-------|
| 1.1 | Update POST /api/products to require logoUrl | #348 |
| 1.2 | Update PATCH /api/products/[id] to handle new fields | #349 |
| 1.3 | Update GET /api/products/public to expose new fields | #350 |
| 1.4 | Create product logo upload API endpoint | #351 |
| 1.5 | Create MongoDB indexes for new fields | #352 |
| 2.1 | Create Square client module | #353 |
| 2.2 | Create Square catalog sync endpoint | #354 |
| 2.3 | Create Square checkout endpoint | #355 |
| 2.4 | Create Square webhook handler | #356 |
| 3.1 | Create promoStore module | #357 |
| 3.2 | Create promo code CRUD API | #358 |
| 3.3 | Create promo validation endpoint | #359 |
| 3.4 | Integrate promo application into Square checkout | #360 |
| 4.1 | Create LogoUpload component | #361 |
| 4.2 | Update ProductsPage.tsx — add logo and GitHub repo to create dialog | #362 |
| 4.3 | Update ProductCard.tsx — render logo thumbnail | #363 |
| 4.4 | Update ProductDetailPage.tsx — logo re-upload and GitHub repo field | #364 |
| 4.5 | Add Pricing configuration section to ProductDetailPage.tsx | #365 |
| 4.6 | Add Promo Codes section to ProductDetailPage.tsx | #366 |
| 4.7 | Create PromoCodeDialog component | #367 |

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `SQUARE_ACCESS_TOKEN` | Square API access token |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` |
| `SQUARE_WEBHOOK_SIGNATURE_KEY` | HMAC key for webhook verification |
| `SQUARE_WEBHOOK_NOTIFICATION_URL` | Webhook notification URL |

---

## Execution

To execute this project:
```
/project-start 100
```
