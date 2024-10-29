import { State } from '../state.js';
import { HTML } from '../html.js';
import { Layout } from './layout.js';

export class StorePage {

  /**
   * Display "subscription details" if there an active subscription, "subscribe" page if not.
   */
  static render(state: State) {
    if (state.isWaitingForWebhook) {
      return Layout.menuLayout(HTML.div('Please wait: PROCESSING YOUR PURCHASES...', { className: "w3-panel w3-orange" }), state);
    }
    else if (state.subscription?.isActive) {
      return StorePage.subscriptionDetails(state);
    }
    else if (state.activeSubscription) {
      // active subscription on the platform,
      // which is probably already associated with a different user
      return StorePage.migrateSubscription(state);
    }
    else {
      return StorePage.subscribe(state);
    }
  }

  /**
   * Display the list of available products
   */
  static subscribe(state: State): string {

    return Layout.menuLayout(HTML.toString([

      // Warning about the store being initialized
      !state.subscriptionServiceReady
        ? HTML.div('Please wait: INITIALIZING STORE...', { className: "w3-panel w3-orange" })
        : null,

      // Info when an order is being processed
      state.isProcessingOrder
        ? HTML.div('Please wait: PROCESSING ORDER...', { className: "w3-panel w3-blue" })
        : null,

      // There's an expired subscription in our receipt, show the expiry date
      state.subscription?.expirationDate
        ? HTML.div(`Your subscription expired on ${new Date(state.subscription?.expirationDate).toISOString()}.`, {className: 'w3-panel w3-red'})
        : null,

      // Styling...
      HTML.h1("Unlock Premium Feature", {className: "w3-section w3-blue w3-center"}),
      HTML.div("Pick the plan that's best for you.", {className: "w3-section w3-center"}),

      // List of available products
      ...state.products.map(p => StorePage.renderProduct(p))
      || HTML.div('No products are available.', { className: "w3-panel w3-orange" }),

      // Styling
      HTML.div('<a href="#">Terms and Conditions</a>', {className: "w3-section w3-center"}),

      // Restore purchases and refresh buttons
      HTML.div([
        HTML.button("Restore Purchases", {
          onclick: () => window.app.subscriptionService.restorePurchases(),
          className: "w3-button w3-blue"
        }),
        HTML.button("Refresh Prices", {
          onclick: () => window.app.subscriptionService.update(),
          className: "w3-button w3-blue"
        }),
      ], { className: "w3-container w3-section w3-black w3-padding-small w3-center" })
    ]), state);
  }

  static renderProduct(product: CdvPurchase.Product): string {
    return HTML.div([
      HTML.h2(product.title?.toUpperCase() ?? null, { className: "w3-section w3-white" }),
      HTML.div(product.description ?? null, { className: "w3-section" }),
      StorePage.renderOffers(product),
    ], { className: "subscription-box w3-container w3-black w3-center w3-section" });
  }

  static renderOffers(product: CdvPurchase.Product) {
    return product.offers ? HTML.div(product.offers.map(offer => {
      return HTML.div([

        HTML.div((offer.pricingPhases || []).map(pricingPhase => {
          return HTML.b(pricingPhase.price)
            + (product.type === CdvPurchase.ProductType.PAID_SUBSCRIPTION
              ? ` (${CdvPurchase.Utils.formatBillingCycleEN(pricingPhase)})`
              : '');
        }).join(' then ')),

        // add the "Buy" button that calls `orderOffer`
        offer.canPurchase
          ? HTML.button("SUBSCRIBE", {
            onclick: `window.app.subscribe('${offer.platform}', '${offer.productId}', '${offer.id}')`,
            className: "w3-button w3-red"
          })
          : HTML.div('(this offer cannot be purchased)')
      ], { className: "w3-section w3-white w3-padding-small" });
    }).join(''), { className: "w3-section" }) : '';
  }

  static subscriptionDetails(state: State): string {

    const sub = state.subscription?.purchase;
    if (!sub) {
      return Layout.menuLayout(HTML.div([
        HTML.h1('YOUR SUBSCRIPTION IS ACTIVE', { className: "w3-section w3-blue w3-center" }),
      ]), state);
    }

    const product = state.products.find(p => p.id === sub.id && p.platform === sub.platform);
    const expiryDate = state.subscription?.expirationDate;
    const expiryDateLabel = sub?.renewalIntent === 'Renew' ? 'Renewal Date' : 'Expires On';
    const platform = sub.platform ?? CdvPurchase.store.defaultPlatform();

    return Layout.menuLayout(HTML.div([

      HTML.h1('YOUR SUBSCRIPTION IS ACTIVE', { className: "w3-section w3-blue w3-center" }),

      // Show the name of the active subscription (if known)
      product?.title ?
        HTML.div(`Subscription: <b>${ product.title.toUpperCase() }</b>`, { className: "w3-section" })
        : null,
      
      // Show the platform user is subscribed from
      HTML.div(`Platform: ${CdvPurchase.Utils.platformName(platform)}`),

      // Show expiry date
      HTML.div(expiryDateLabel + ': ' + expiryDate, { className: "w3-section" }),

      // 
      sub?.renewalIntent === 'Lapse'
        ? HTML.div('You will loose access to premium features at the end of the period.', {
          className: "w3-panel w3-red"
        })
        : null,

      // Warn if the subscription is billing retry period (platform fails to charge)
      sub?.isBillingRetryPeriod
        ? HTML.div([
          'WARNING: There seems to be a problem with your payment method. ',
          HTML.button("Manage Billing", {
            onclick: `CdvPurchase.store.manageBilling('${sub.platform}')`,
            className: "w3-button w3-black"
          })
        ], { className: "w3-panel w3-red" })
        : null,

      // Show the "Manage Subscription" button
      CdvPurchase.store.getAdapter(platform)?.ready
        ? HTML.button("Manage Subscription", {
          onclick: `CdvPurchase.store.manageSubscriptions('${sub.platform}')`,
          className: "w3-button w3-blue"
        })
        : HTML.p(`Use ${CdvPurchase.Utils.platformName(platform)} to update your subscription.`, { className: "w3-panel w3-blue" }),
    ], { className: "w3-container w3-center" }), state);
  }

  static migrateSubscription(state: State) {
    const sub = state.activeSubscription!;
    const product = state.products.find(p => p.id === sub.id && p.platform === sub.platform);
    return Layout.menuLayout(HTML.div([
      HTML.h1('SUBSCRIPTION', { className: "w3-section w3-blue w3-center" }),
      HTML.p('Subscription to "' + (product?.title || state.activeSubscription?.id) + '" on "' + CdvPurchase.Utils.platformName(sub.platform ?? CdvPurchase.store.defaultPlatform()) + '" is associated with a different user.'),
      HTML.p('Please contact us at <a href="mailto:email@example.com">email@example.com</a> if you wish to migrate this subscription to a different user.'),
      HTML.pre(JSON.stringify(state.transactions, null, 2)),
    ]), state);
  }
}