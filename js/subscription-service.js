const IAPTIC_CONFIG = {
    url: 'https://validator-staging.iaptic.com',
    appName: 'test.hoelt.fovea',
    apiKey: '960a4319-37d0-4f5c-9c78-4632fc520b2b'
};
/**
 * Subscribe with In-App Purchases
 */
export class SubscriptionService {
    constructor(store, state) {
        this.store = store;
        this.state = state;
    }
    initialize() {
        // We will initialize the in-app purchase plugin here.
        // We should first register all our products or we cannot use them in the app.
        this.store.register([
            CdvPurchase.Test.testProducts.PAID_SUBSCRIPTION,
            // CdvPurchase.Test.testProducts.PAID_SUBSCRIPTION_ACTIVE,
            {
                platform: CdvPurchase.Platform.GOOGLE_PLAY,
                id: 'subscription1',
                type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
            },
            {
                platform: CdvPurchase.Platform.GOOGLE_PLAY,
                id: 'subscription2',
                type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
            }
        ]);
        // Setup the receipt validator service.
        const iaptic = new CdvPurchase.Iaptic(IAPTIC_CONFIG);
        this.store.validator = iaptic.validator;
        this.store.verbosity = CdvPurchase.LogLevel.DEBUG;
        this.setupEventHandlers();
        // Load information about products and purchases
        return this.store.initialize([CdvPurchase.Platform.GOOGLE_PLAY, CdvPurchase.Platform.TEST]).then((value) => {
            this.state.set({
                ready: true
            });
            return;
        });
    }
    stateUpdates() {
        // subscription purchases sorted by expiry date
        const sortedSubscriptions = this.store.verifiedPurchases.concat()
            .filter(purchase => {
            const product = this.store.get(purchase.id, purchase.platform);
            return (product === null || product === void 0 ? void 0 : product.type) === CdvPurchase.ProductType.PAID_SUBSCRIPTION;
        })
            .sort((a, b) => { var _a, _b, _c, _d; return ((_b = (_a = a.expiryDate) !== null && _a !== void 0 ? _a : a.purchaseDate) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = b.expiryDate) !== null && _c !== void 0 ? _c : b.purchaseDate) !== null && _d !== void 0 ? _d : 0); });
        // active one
        const activeSubscription = this.store.verifiedPurchases.find(purchase => {
            const product = this.store.get(purchase.id, purchase.platform);
            return (product === null || product === void 0 ? void 0 : product.type) === CdvPurchase.ProductType.PAID_SUBSCRIPTION && product.owned;
        });
        // no active one, show info about the expired one
        const expiredSubscription = activeSubscription ? undefined : sortedSubscriptions.slice(-1)[0];
        return { activeSubscription, expiredSubscription };
    }
    setupEventHandlers() {
        this.store.when()
            .productUpdated(() => {
            this.state.set(Object.assign({ products: this.store.products }, this.stateUpdates()));
        })
            .receiptsReady(() => {
            this.state.set(Object.assign({ transactions: this.store.localTransactions }, this.stateUpdates()));
        })
            .receiptUpdated(receipt => {
            this.state.set(Object.assign({ transactions: this.store.localTransactions }, this.stateUpdates()));
        })
            .approved(transaction => {
            transaction.verify();
            this.state.set(Object.assign({ isVerifying: true }, this.stateUpdates()));
        })
            .verified(receipt => {
            this.state.set(Object.assign({ purchases: this.store.verifiedPurchases, isVerifying: false }, this.stateUpdates()));
            receipt.finish();
        })
            .unverified(unverified => {
            this.state.set(Object.assign({ isProcessingOrder: false, isVerifying: false }, this.stateUpdates()));
        })
            .finished(transaction => {
            this.state.set(Object.assign({ isProcessingOrder: false }, this.stateUpdates()));
        });
        // Show errors for 10 seconds.
        this.store.error(error => {
            if (error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
                console.log('The user cancelled the purchase flow.');
                return;
            }
            this.state.set({ error: `ERROR ${error.code}: ${error.message}` });
            setTimeout(() => {
                this.state.set({ error: `` });
            }, 10000);
        });
    }
    subscribe(platform, productId, offerId) {
        var _a, _b;
        this.state.set({ isProcessingOrder: true, error: '' });
        (_b = (_a = this.store.get(productId, platform)) === null || _a === void 0 ? void 0 : _a.getOffer(offerId)) === null || _b === void 0 ? void 0 : _b.order().then(error => {
            if (error) {
                this.state.set({ isProcessingOrder: false });
            }
            if ((error === null || error === void 0 ? void 0 : error.code) === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
                // payment cancelled by the user
            }
        });
    }
    update() {
        this.store.update();
    }
    restorePurchases() {
        this.store.restorePurchases();
    }
}
