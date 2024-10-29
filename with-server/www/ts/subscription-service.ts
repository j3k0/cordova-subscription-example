import { State } from './state.js';
import { APPLE_SUBSCRIPTIONS, GOOGLE_SUBSCRIPTIONS, IAPTIC_CONFIG, TEST_SUBSCRIPTIONS } from './configuration.js';

/**
 * Subscribe with In-App Purchases
 */
export class SubscriptionService {

  logger: CdvPurchase.Logger;
  private store: CdvPurchase.Store;
  private state: State;

  constructor(store: CdvPurchase.Store, state: State, applicationUsername: () => (string | undefined)) {
    this.logger = new CdvPurchase.Logger({ verbosity: CdvPurchase.LogLevel.DEBUG }, 'SubscriptionService');
    this.store = store;
    this.state = state;
    this.store.applicationUsername = applicationUsername;
  }

  initialize(): Promise<void> {
    this.logger.debug('initialize');
    // We will initialize the in-app purchase plugin here.
    // We should first register all our products or we cannot use them in the app.

    const products = [
      ...APPLE_SUBSCRIPTIONS.map(id => ({
        id,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
      } as CdvPurchase.IRegisterProduct)),
      ...GOOGLE_SUBSCRIPTIONS.map(id => ({
        id,
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
      } as CdvPurchase.IRegisterProduct)),
      ...TEST_SUBSCRIPTIONS.map(id => ({
        id,
        platform: CdvPurchase.Platform.TEST,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
      } as CdvPurchase.IRegisterProduct)),
    ];

    this.store.register(products);

    // Setup the receipt validator service.
    const iaptic = new CdvPurchase.Iaptic(IAPTIC_CONFIG);
    this.store.validator = iaptic.validator;
    this.store.verbosity = CdvPurchase.LogLevel.DEBUG;

    this.setupEventHandlers();

    // Load information about products and purchases
    return this.store.initialize([
      CdvPurchase.Platform.GOOGLE_PLAY,
      CdvPurchase.Platform.TEST,
      {
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
        options: {
          needAppReceipt: true,
          discountEligibilityDeterminer: iaptic.appStoreDiscountEligibilityDeterminer,
        }
      }
    ])
    .then((value: CdvPurchase.IError[]): void => {
      this.logger.debug('initialize: success');
      this.state.set({ subscriptionServiceReady: true });
    });
  }

  private stateUpdates(): Partial<State> {

    this.logger.debug('stateUpdates');

    // subscription purchases sorted by expiry date
    const sortedSubscriptions = this.store.verifiedPurchases
    .filter(purchase => {
      const product = this.store.get(purchase.id, purchase.platform);
      return product?.type === CdvPurchase.ProductType.PAID_SUBSCRIPTION;
    })
    .sort((a, b) => (a.expiryDate ?? a.purchaseDate ?? 0) - (b.expiryDate ?? b.purchaseDate ?? 0));

    // active one
    const activeSubscription = this.store.verifiedPurchases.find(purchase => {
      const product = this.store.get(purchase.id, purchase.platform);
      return product?.type === CdvPurchase.ProductType.PAID_SUBSCRIPTION && product.owned;
    });

    // no active one, show info about the expired one
    const expiredSubscription = activeSubscription ? undefined : sortedSubscriptions.slice(-1)[0];

    return { activeSubscription, expiredSubscription };
  }

  private setupEventHandlers() {

    this.logger.debug('setupEventHandlers');

    this.store.when()
      .productUpdated(() => {
        this.logger.debug('productUpdated');
        this.state.set({
          products: this.store.products,
          ...this.stateUpdates()
        });
      })
      .receiptsReady(() => {
        this.logger.debug('receiptsReady');
        this.state.set({
          transactions: this.store.localTransactions,
          ...this.stateUpdates()
        });
      })
      .receiptUpdated(receipt => {
        this.logger.debug('receiptUpdated: ' + receipt.platform + ' for products: ' + receipt.transactions.map(t => t.products.map(p => p.id).join(',')).join(';'));
        this.state.set({
          transactions: this.store.localTransactions,
          ...this.stateUpdates()
        });
      })
      .approved(transaction => {
        transaction.verify();
        this.state.set({
          isVerifying: true,
          ...this.stateUpdates()
        });
      })
      .verified(receipt => {
        this.logger.debug('verified: ' + receipt.id + ' for products: ' + receipt.collection.map(p => p.id).join(','));
        this.state.set({
          purchases: this.store.verifiedPurchases,
          isVerifying: false,
          ...this.stateUpdates()
        });
        receipt.finish();
        this.verifiedCallback.forEach(callback => callback());
      })
      .unverified(unverified => {
        this.logger.debug('unverified');
        this.state.set({
          isProcessingOrder: false,
          isVerifying: false,
          ...this.stateUpdates()
        });
      })
      .finished(transaction => {
        this.logger.debug('finished');
        this.state.set({
          isProcessingOrder: false,
          ...this.stateUpdates()
        });
      });

    // Show errors for 10 seconds.
    this.store.error(error => {
      this.logger.debug('error: ' + error.code + ': ' + error.message);
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

  subscribe(platform: CdvPurchase.Platform, productId: string, offerId: string) {
    this.logger.debug('subscribe: ' + platform + ' ' + productId + ' ' + offerId);
    this.state.set({ isProcessingOrder: true, error: '' });
    this.store.get(productId, platform)?.getOffer(offerId)?.order()
      .then(error => {
        if (error) {
          this.state.set({ isProcessingOrder: false });
        }
        if (error?.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
          // payment cancelled by the user
        }
      });
  }

  update() {
    this.logger.debug('update');
    this.state.set({ isRefreshing: true });
    this.store.update()
    .then(() => {
      this.state.set({ isRefreshing: false });
    });
  }

  restorePurchases() {
    this.logger.debug('restorePurchases');
    this.state.set({ isRefreshing: true });
    this.store.restorePurchases()
    .then(() => {
      this.state.set({ isRefreshing: false });
    });
  }

  // called when a receipt has been verified with the server.
  private verifiedCallback: VoidFunction[] = [];
  onVerified(callback: VoidFunction) {
    this.logger.debug('register onVerified handler');
    this.verifiedCallback.push(callback);
  }
}