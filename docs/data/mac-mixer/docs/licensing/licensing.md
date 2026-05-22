---
productId: mac-mixer
title: Licensing
---

# Licensing

<p class="description">Mac Mixer supports a local trial, a direct annual license, and a Mac App Store subscription build.</p>

## Trial

Mac Mixer tracks a 30-day local trial. Trial state is mirrored in Keychain and UserDefaults so a reset of Application Support does not accidentally reset licensing state.

When the trial expires, the app opens the subscription prompt for the active distribution channel.

## Direct license

The direct build uses `consulting.stokd.cloud` for checkout and license validation:

- Product ID: `mac-mixer`
- Display price in the app: `$10/year`
- License API: `https://consulting.stokd.cloud/api/licenses`
- Activation URL scheme: `macmixer://activate-license?key=...`
- Checkout return path: `macmixer://checkout-complete`
- Offline grace period after a successful validation: 7 days

The license key is bound to the machine through a hardware identifier and cached locally for offline use.

## Mac App Store subscription

The Mac App Store build uses StoreKit 2 and the Mac Mixer Pro subscription group:

| Product                                      | Price configured for local/App Store setup |
| :------------------------------------------- | :----------------------------------------- |
| `com.stokedconsulting.MacMixer.monthly`      | `$1.50/month`                              |
| `com.stokedconsulting.MacMixer.annual`       | `$13.99/year`                              |

The StoreKit path supports purchase, restore purchases, entitlement listening, and opening Apple's subscription management screen.

## Privacy and network use

Mac Mixer does not upload audio. Network calls are limited to licensing, checkout, entitlement refresh, and optional product-promo content. Route configuration and audio processing stay local to the Mac.
