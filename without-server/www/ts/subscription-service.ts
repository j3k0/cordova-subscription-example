import { State } from './state.js';

const IAPTIC_CONFIG: CdvPurchase.IapticConfig = {
  appName: '',
  apiKey: '',
}

const APPLE_SUBSCRIPTIONS = [
  'demo_monthly_basic',
  'demo_weekly_basic',
  'monthly_with_intro',
  'monthy_with_discounts'
];
const GOOGLE_SUBSCRIPTIONS = [
  'subscription1',
  'subscription2'
];
const TEST_SUBSCRIPTIONS = [
  'test-subscription',
  // 'test-subscription-active',
  // CdvPurchase.Test.testProducts.PAID_SUBSCRIPTION,
  // CdvPurchase.Test.testProducts.PAID_SUBSCRIPTION_ACTIVE,
];

/**
 * Subscribe with In-App Purchases
 */
export class SubscriptionService {

  private store: CdvPurchase.Store;
  private state: State;

  constructor(store: CdvPurchase.Store, state: State) {
    this.store = store;
    this.state = state;
  }

  initialize(): Promise<void> {
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
      this.state.set({ ready: true });
    });
  }

  private stateUpdates(): Partial<State> {

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

    this.store.when()
      .productUpdated(() => {
        this.state.set({
          products: this.store.products,
          ...this.stateUpdates()
        });
      })
      .receiptsReady(() => {
        this.state.set({
          transactions: this.store.localTransactions,
          ...this.stateUpdates()
        });
      })
      .receiptUpdated(receipt => {
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
        this.state.set({
          purchases: this.store.verifiedPurchases,
          isVerifying: false,
          ...this.stateUpdates()
        });
        receipt.finish();
      })
      .unverified(unverified => {
        this.state.set({
          isProcessingOrder: false,
          isVerifying: false,
          ...this.stateUpdates()
        });
      })
      .finished(transaction => {
        this.state.set({
          isProcessingOrder: false,
          ...this.stateUpdates()
        });
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

  subscribe(platform: CdvPurchase.Platform, productId: string, offerId: string) {
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
    this.state.set({ isRefreshing: true });
    this.store.update()
    .then(() => {
      this.state.set({ isRefreshing: false });
    });
  }

  restorePurchases() {
    this.state.set({ isRefreshing: true });
    this.store.restorePurchases()
    .then(() => {
      this.state.set({ isRefreshing: false });
    });
  }
}