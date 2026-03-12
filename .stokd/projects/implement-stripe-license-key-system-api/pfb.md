# Implement Stripe License Key System API

## 1. Feature Overview
**Feature Name:** Stripe License Key System API
**Owner:** Brian Stoker
**Status:** Proposed
**Target Release:** TBD

### Summary
Implement a Stripe-powered license key system API in the stoked-ui backend (NestJS + MongoDB + AWS Lambda via SST). The system enables users to purchase product licenses ($10/year) via Stripe Checkout, receive license keys by email (SES), and activate/validate/deactivate those keys from client applications. The API is designed to be product-agnostic, supporting Flux as the first licensed product with the architecture ready to onboard additional desktop apps in the future.

---

## 2. Problem Statement
### What problem are we solving?
The Flux macOS desktop application currently relies on Apple StoreKit for in-app purchases and subscription management. StoreKit ties monetization exclusively to the Apple ecosystem, limits pricing flexibility, imposes a 30% platform fee, and provides no server-side control over license state. We need a self-hosted licensing system that gives us full control over key generation, activation, and subscription lifecycle -- while remaining offline-friendly for desktop users who may not always have internet access.

### Who is affected?
- **Primary user:** The development team building and maintaining the stoked-ui backend and the Flux desktop app. This API is the server-side foundation that client applications will integrate against.
- **Secondary users:** End users of Flux (and future stoked-ui desktop products) who purchase licenses and need a reliable, low-friction activation experience.

### Why now?
- Flux is transitioning from StoreKit to a Stripe-based licensing model to reduce platform fees, gain pricing control, and enable cross-platform licensing in the future.
- The stoked-ui backend already has a working NestJS + MongoDB + Lambda stack (with blog, media, invoice, and auth modules), making it the natural place to host this system.
- The backend API must be implemented first before the Swift client can begin integration work (the client lives in a separate repo and is out of scope here).

---

## 3. Goals & Success Metrics
### Goals
- Deliver a fully functional license key API that handles the complete lifecycle: checkout, key generation, activation, validation, deactivation, renewal, and expiration.
- Process Stripe payment events via webhooks to automatically create and manage licenses.
- Send license keys to customers via AWS SES upon successful purchase.
- Build the system generically so any product (not just Flux) can be onboarded by adding a row to the `product` collection.
- Maintain offline-friendliness: clients validate once on activation and trust a local cache, only re-validating when the grace period nears expiration.

### Success Metrics (How we'll know it worked)
- All five API endpoints (`activate`, `validate`, `deactivate`, `checkout`, `webhooks/stripe`) return correct responses when tested via curl against the deployed Lambda.
- Stripe webhook events (`checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`) are processed correctly: licenses are created, renewed, and expired as expected.
- License keys are generated in the correct format (`{PREFIX}-XXXX-XXXX-XXXX`) with 60 bits of entropy using the unambiguous alphabet.
- SES email delivery succeeds after a completed checkout session.
- Deactivation enforces the 3-per-year limit.
- The `product` model allows registering new products without code changes to the license module.

---

## 4. User Experience & Scope
### In Scope
- **Mongoose models** in `sui-common-api`: `license.model.ts` (key, email, productId, hardwareId, machineName, status enum, activation/expiration dates, Stripe IDs, deactivation count, activation history) and `product.model.ts` (productId, name, keyPrefix, stripePriceId, duration/grace/trial config, purchaseUrl).
- **Model registration**: Export from `models/index.ts`, register `LicenseFeature` and `ProductFeature` in `database.module.ts`.
- **NestJS license module** in `sui-media-api`: `license.module.ts`, `license.controller.ts`, `license.service.ts`, `stripe.service.ts`, `stripe.controller.ts`, and DTOs (`activate-license.dto.ts`, `validate-license.dto.ts`, `deactivate-license.dto.ts`, `create-checkout.dto.ts`, `license-response.dto.ts`).
- **API endpoints**: `POST /v1/licenses/activate`, `POST /v1/licenses/validate`, `POST /v1/licenses/deactivate`, `POST /v1/licenses/checkout`, `POST /v1/webhooks/stripe`.
- **License key generation**: Unambiguous alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`), format `{PREFIX}-{XXXX}-{XXXX}-{XXXX}`, 60 bits entropy.
- **Stripe webhook handling**: `checkout.session.completed` (create license + email via SES), `invoice.payment_succeeded` (extend `expiresAt`), `customer.subscription.deleted` (let license expire naturally).
- **Infrastructure changes**: Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `infra/secrets.ts`; link secrets and add environment variables in `infra/api.ts`; add `stripe` npm dependency to `sui-media-api/package.json`; enable `rawBody: true` in `lambda.bootstrap.ts` for Stripe signature verification; import `LicenseModule` in `app.module.ts`.
- **SES email integration**: Send license key to customer email upon successful checkout.

### Out of Scope
- **Swift/macOS client implementation**: `LicenseManager.swift`, `LicensePrompt.swift`, `HardwareID.swift`, UI changes in the Flux app. This work lives in a separate repository (`/Users/stoked/work/flux/apps/flux`).
- **Stripe Dashboard configuration**: Creating products, prices, and webhook endpoint configuration in the Stripe Dashboard is a manual operations step, not part of this codebase.
- **Admin UI or dashboard**: No web-based admin panel for managing licenses. License management is done via direct database access or future tooling.
- **Multi-device licensing**: Each license activates on one machine at a time. Multi-seat licensing is not in scope.
- **Rate limiting or abuse protection**: Not included in this initial implementation beyond the 3-deactivations-per-year limit.
- **Unit/integration test suite**: While testability is a design consideration, writing a comprehensive test suite is not a deliverable of this initial implementation. Manual curl-based verification is the stated verification approach.

---

## 5. Assumptions & Constraints
### Assumptions
- A Stripe account is already set up with products and prices configured for Flux ($10/year subscription).
- AWS SES is already configured and verified for the sending domain (the existing `infra/api.ts` already references SES permissions for email sending).
- The existing `sui-common-api` model patterns (`@StdSchema`, `SchemaFactory`, `ModelDefinition` exports) are stable and should be followed for new models.
- The existing `database.module.ts` pattern of registering `MongooseModule.forFeature([...])` is the correct approach for adding new models.
- MongoDB is the sole data store; no separate caching layer (Redis, etc.) is needed.
- Clients will cache license state locally (Keychain on macOS) and only call `validate` when approaching grace period expiration, keeping API call volume low.

### Constraints
- **Technical**: The Lambda is deployed behind API Gateway v2 via SST. Stripe webhook signature verification requires access to the raw request body, which means `rawBody: true` must be enabled in `NestFactory.create`. This affects all routes, not just the webhook endpoint.
- **Technical**: The Lambda has a 29-second timeout (`infra/api.ts`). Stripe webhook processing (create license + send SES email) must complete well within this window.
- **Technical**: The `@codegenie/serverless-express` adapter is used for Lambda integration. The `rawBody` option must be compatible with this adapter's request handling.
- **Infrastructure**: Secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) must be provisioned via SST's `sst.Secret` mechanism and linked to the Lambda function.
- **Security**: Stripe webhook endpoints must verify the `stripe-signature` header using the webhook secret. License endpoints do not require JWT authentication (they use license key + hardware ID as their auth mechanism).
- **Timeline**: TBD -- depends on team capacity and prioritization against other backend work.

---

## 6. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| `rawBody: true` breaks existing routes or increases memory usage | Medium -- could cause regressions in media upload, blog, or invoice endpoints | Test all existing endpoints after enabling rawBody. The NestJS `rawBody` option stores a copy of the body buffer, so monitor Lambda memory. The current 1024 MB allocation should be sufficient. |
| Stripe webhook replay or duplicate events create duplicate licenses | High -- customer receives multiple keys, data integrity issues | Use `stripeSubscriptionId` as a unique constraint or check for existing license before creating. Stripe sends events with idempotency; implement idempotent webhook handling. |
| SES email delivery failures mean customer never receives license key | High -- customer paid but has no key | Log SES errors. Provide a fallback: license key can be retrieved via a "resend key" endpoint or by contacting support. Consider adding the key to the Stripe checkout success page redirect URL. |
| Key collision in generated license keys | Low -- 60 bits of entropy makes collision extremely unlikely | Use `crypto.randomBytes` for generation. The `key` field has a unique index in MongoDB, so duplicates will throw and can be retried. |
| Lambda cold starts delay webhook processing, causing Stripe retries | Medium -- Stripe retries after timeouts, potentially causing duplicate processing | Implement idempotent webhook handling. The existing bootstrap is optimized; adding the Stripe SDK should not significantly increase cold start time. |
| Deactivation abuse (repeatedly deactivating/reactivating to share a license) | Medium -- revenue loss | Enforce 3-deactivation-per-year hard limit in the API. Track `deactivationCount` and `activationHistory` for audit. |

---

## 7. Dependencies
- **Internal packages**:
  - `@stoked-ui/common-api` (`sui-common-api`) -- new Mongoose models (`license.model.ts`, `product.model.ts`) are added here.
  - `@stoked-ui/media-api` (`sui-media-api`) -- the NestJS license module is added here.
- **External services**:
  - **Stripe** -- payment processing, checkout sessions, subscription management, webhook events. Requires the `stripe` npm package.
  - **AWS SES** -- sending license key emails to customers after purchase. Already partially configured in the infrastructure (existing subscribe/verify Lambda functions use SES).
  - **MongoDB** -- data persistence for license and product documents. Already provisioned and connected via `MONGODB_URI`.
- **Infrastructure (SST)**:
  - New secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` in `infra/secrets.ts`.
  - Updated Lambda configuration in `infra/api.ts`: link new secrets, add environment variables, add SES permissions to the `MediaApi` function.
- **Stripe Dashboard (manual)**:
  - Create Flux product and $10/year price.
  - Configure webhook endpoint URL pointing to `POST /v1/webhooks/stripe`.
  - Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`.

---

## 8. Open Questions
- What email template should be used for the license key delivery email? Plain text with the key, or a branded HTML template?
- Should the `POST /v1/licenses/checkout` endpoint accept a `productId` parameter to look up the `stripePriceId` from the product model, or should the client pass the Stripe price ID directly?
- Is there a need for a "resend license key" endpoint for customers who lost their email, or will this be handled via support?
- Should the webhook endpoint be on a separate path prefix (e.g., `/webhooks/stripe` without the `/v1` prefix) to simplify Stripe Dashboard configuration and avoid versioning concerns?
- What CORS policy should apply to the license endpoints? The Flux desktop app makes direct HTTP calls (not browser-based), so CORS may not be relevant for the primary use case, but the checkout endpoint may be called from the website.
- Should the `product` collection be seeded via a database init script (extending the existing `db:init` script), or managed manually?
- What is the grace period behavior when a subscription payment fails? The spec says 14 days default -- should this be configurable per product (it is in the model), and what user-facing messaging should the API support?
- Should the API support listing all licenses for an email address (e.g., for a "manage my licenses" page on the website)?

---

## 9. Non-Goals
- **Building a client SDK or library.** The API exposes standard REST endpoints; client integration is the responsibility of each app's codebase.
- **Implementing a web-based admin dashboard** for viewing or managing licenses.
- **Supporting multi-device or multi-seat licensing.** Each license key activates on exactly one machine at a time.
- **Handling Stripe refunds or disputes.** Refund processing and chargeback handling are not part of this initial implementation.
- **Building a customer-facing license management portal.** Customers manage their license through the app itself (activate/deactivate) and Stripe's customer portal (subscription management).
- **Implementing free trial logic on the backend.** Trial periods are managed client-side (the `trialDurationDays` field in the product model is informational for clients, not enforced by the API).
- **Migrating existing StoreKit subscribers.** There is no data migration path from Apple's StoreKit to this system; existing subscribers will need to obtain new license keys.
- **Implementing rate limiting, IP blocking, or advanced abuse detection** beyond the deactivation count limit.

---

## 10. Notes & References
- **Technical Spec:** `/Users/stoked/.claude/plans/glistening-pondering-tide.md` -- full implementation plan covering both backend and Swift client (only backend is in scope for this project).
- **Existing Model Pattern:** `/opt/worktrees/stoked-ui/stoked-ui-main/packages/sui-common-api/src/models/blogPost.model.ts` -- reference for `@StdSchema`, `SchemaFactory`, `ModelDefinition` export pattern.
- **Database Module:** `/opt/worktrees/stoked-ui/stoked-ui-main/packages/sui-media-api/src/database/database.module.ts` -- where `LicenseFeature` and `ProductFeature` will be registered.
- **App Module:** `/opt/worktrees/stoked-ui/stoked-ui-main/packages/sui-media-api/src/app.module.ts` -- where `LicenseModule` will be imported.
- **Infrastructure Secrets:** `/opt/worktrees/stoked-ui/stoked-ui-main/infra/secrets.ts` -- where Stripe secrets will be added.
- **Infrastructure API:** `/opt/worktrees/stoked-ui/stoked-ui-main/infra/api.ts` -- where the MediaApi Lambda function is configured; secrets and SES permissions will be added here.
- **Lambda Bootstrap:** `/opt/worktrees/stoked-ui/stoked-ui-main/packages/sui-media-api/src/lambda.bootstrap.ts` -- where `rawBody: true` must be enabled.
- **Implementation Order (Backend Only):** Models -> DTOs -> License service + controller -> Stripe service + controller -> License module + app wiring -> Infrastructure (secrets, rawBody, stripe dep).
- **Stripe Documentation:** [Stripe Checkout](https://docs.stripe.com/checkout), [Stripe Webhooks](https://docs.stripe.com/webhooks), [Stripe Node.js SDK](https://github.com/stripe/stripe-node).
- **Verification Plan:** Test endpoints with curl (`activate`, `validate`, `deactivate`). Configure webhook in Stripe Dashboard and test with `stripe trigger checkout.session.completed`. Verify SES email delivery.
