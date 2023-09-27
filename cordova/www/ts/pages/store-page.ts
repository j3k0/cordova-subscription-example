import { State } from '../state.js';
import { HTML } from '../html.js';
import { Layout } from './layout.js';

export class StorePage {

  static render(state: State) {
    if (state.activeSubscription) {
      return StorePage.subscriptionDetails(state);
    }
    else {
      return StorePage.subscribe(state);
    }
  }

  static subscribe(state: State): string {

    return Layout.menuLayout(HTML.toString([

      // Warning about the store being initialized
      !state.ready
        ? HTML.div('Please wait: INITIALIZING STORE...', { className: "w3-panel w3-orange" })
        : null,

      // Info when an order is being processed
      state.isProcessingOrder
        ? HTML.p('Please wait: PROCESSING ORDER...', { className: "w3-panel w3-blue" })
        : null,

      state.expiredSubscription?.expiryDate
        ? HTML.div(`Your subscription expired on ${new Date(state.expiredSubscription.expiryDate).toISOString()}.`, {className: 'w3-panel w3-red'})
        : null,

      //
      HTML.h1("Unlock Premium Feature", {className: "w3-section w3-blue w3-center"}),
      HTML.div("Pick the plan that's best for you.", {className: "w3-section w3-center"}),

      // List of available products
      ...(state.products.map(product => HTML.div([
        HTML.h2(product.title?.toUpperCase() ?? null, { className: "w3-section w3-white" }),
        HTML.div(product.description ?? null, { className: "w3-section" }),
        renderOffers(product),
      ], { className: "w3-container w3-black w3-center w3-section" }))) || 'No products are available',

      HTML.div('<a href="#">Terms and Conditions</a>', {className: "w3-section w3-center"}),

      // Restore purchases and refresh buttons
      HTML.div([
        HTML.button("Restore Purchases", { onclick: "app.subscriptionService.restorePurchases()", className: "w3-button w3-blue" }),
        HTML.button("Refresh Prices", { onclick: "app.subscriptionService.update()", className: "w3-button w3-blue" }),
      ], { className: "w3-container w3-section w3-black w3-padding-small w3-center" })
    ]), state);
  }

  static subscriptionDetails(state: State): string {

    const sub = state.activeSubscription!;
    const product = state.products.find(p => p.id === sub.id && p.platform === sub.platform);
    const expiryDate = new Date(sub.expiryDate || 0).toISOString();
    const expiryDateLabel = sub?.renewalIntent === 'Renew' ? 'Renewal Date' : 'Expires On';

    return Layout.menuLayout(HTML.div([

      HTML.h1('YOUR SUBSCRIPTION IS ACTIVE', { className: "w3-section w3-blue w3-center" }),

      // Show the name of the active subscription (if known)
      product?.title ?
        HTML.div(`Subscription: <b>${ product.title.toUpperCase() }</b>`, { className: "w3-section" })
        : null,

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
      HTML.button("Manage Subscription", {
        onclick: `CdvPurchase.store.manageSubscriptions('${sub.platform}')`,
        className: "w3-button w3-blue"
      }),
    ], { className: "w3-container w3-center" }), state);
  }
}

const renderOffers = (product: CdvPurchase.Product) => {
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
          onclick: `app.subscribe('${offer.platform}', '${offer.productId}', '${offer.id}')`,
          className: "w3-button w3-red"
        })
        : HTML.div('(this offer cannot be purchased)')
    ], { className: "w3-section w3-white w3-padding-small" });
  }).join(''), { className: "w3-section" }) : '';
}