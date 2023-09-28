import { HTML } from '../html.js';
import { Layout } from './layout.js';
export class StorePage {
    static render(state) {
        if (state.activeSubscription) {
            return StorePage.subscriptionDetails(state);
        }
        else {
            return StorePage.subscribe(state);
        }
    }
    static subscribe(state) {
        var _a;
        return Layout.menuLayout(HTML.toString([
            // Warning about the store being initialized
            !state.ready
                ? HTML.div('Please wait: INITIALIZING STORE...', { className: "w3-panel w3-orange" })
                : null,
            // Info when an order is being processed
            state.isProcessingOrder
                ? HTML.p('Please wait: PROCESSING ORDER...', { className: "w3-panel w3-blue" })
                : null,
            ((_a = state.expiredSubscription) === null || _a === void 0 ? void 0 : _a.expiryDate)
                ? HTML.div(`Your subscription expired on ${new Date(state.expiredSubscription.expiryDate).toISOString()}.`, { className: 'w3-panel w3-red' })
                : null,
            //
            HTML.h1("Unlock Premium Feature", { className: "w3-section w3-blue w3-center" }),
            HTML.div("Pick the plan that's best for you.", { className: "w3-section w3-center" }),
            // List of available products
            ...(state.products.map(product => {
                var _a, _b, _c;
                return HTML.div([
                    HTML.h2((_b = (_a = product.title) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : null, { className: "w3-section w3-white" }),
                    HTML.div((_c = product.description) !== null && _c !== void 0 ? _c : null, { className: "w3-section" }),
                    renderOffers(product),
                ], { className: "subscription-box w3-container w3-black w3-center w3-section" });
            })) || 'No products are available',
            HTML.div('<a href="#">Terms and Conditions</a>', { className: "w3-section w3-center" }),
            // Restore purchases and refresh buttons
            HTML.div([
                HTML.button("Restore Purchases", { onclick: "app.subscriptionService.restorePurchases()", className: "w3-button w3-blue" }),
                HTML.button("Refresh Prices", { onclick: "app.subscriptionService.update()", className: "w3-button w3-blue" }),
            ], { className: "w3-container w3-section w3-black w3-padding-small w3-center" })
        ]), state);
    }
    static subscriptionDetails(state) {
        const sub = state.activeSubscription;
        const product = state.products.find(p => p.id === sub.id && p.platform === sub.platform);
        const expiryDate = new Date(sub.expiryDate || 0).toISOString();
        const expiryDateLabel = (sub === null || sub === void 0 ? void 0 : sub.renewalIntent) === 'Renew' ? 'Renewal Date' : 'Expires On';
        return Layout.menuLayout(HTML.div([
            HTML.h1('YOUR SUBSCRIPTION IS ACTIVE', { className: "w3-section w3-blue w3-center" }),
            // Show the name of the active subscription (if known)
            (product === null || product === void 0 ? void 0 : product.title) ?
                HTML.div(`Subscription: <b>${product.title.toUpperCase()}</b>`, { className: "w3-section" })
                : null,
            // Show expiry date
            HTML.div(expiryDateLabel + ': ' + expiryDate, { className: "w3-section" }),
            // 
            (sub === null || sub === void 0 ? void 0 : sub.renewalIntent) === 'Lapse'
                ? HTML.div('You will loose access to premium features at the end of the period.', {
                    className: "w3-panel w3-red"
                })
                : null,
            // Warn if the subscription is billing retry period (platform fails to charge)
            (sub === null || sub === void 0 ? void 0 : sub.isBillingRetryPeriod)
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
const renderOffers = (product) => {
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
};
