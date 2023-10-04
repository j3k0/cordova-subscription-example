import { ServerSubscription } from "./session.js";
import { ServerContent } from "./dynamic-content.js";

export type Page = 'home' | 'store';

/**
 * The application state.
 */
export class State {

  page: Page = 'home';

  /** True if the local subscription service is ready */
  subscriptionServiceReady: boolean = false;

  /** True if the user is logged in, and its session data has been loaded */
  sessionReady: boolean = false;

  /** True when the session is being restored */
  isRestoringSession: boolean = false;

  error: string = '';

  isLogin: boolean = false;
  isProcessingOrder: boolean = false;
  isRefreshing: boolean = false;
  isVerifying: boolean = false;

  /** User that logged in, or attempted to (cf sessionReady) */
  username?: string;

  /** Subscription reported by our server */
  subscription?: ServerSubscription;

  /** Some free content loaded from the server */
  freeContentLoading: boolean = false;
  freeContent?: ServerContent;

  /** Some premium content loaded from the server */
  premiumContentLoading: boolean = false;
  premiumContent?: ServerContent;

  /** Subscription present on the device's receipt. */
  activeSubscription?: CdvPurchase.VerifiedPurchase;

  /** Subscription expired, as reported on the device's receipt. */
  expiredSubscription?: CdvPurchase.VerifiedPurchase;

  products: CdvPurchase.Product[] = [];
  purchases: CdvPurchase.VerifiedPurchase[] = [];
  transactions: CdvPurchase.Transaction[] = [];

  render: (state: State) => void;
  constructor(render: (state: State) => void) {
    this.render = render;
  }

  /**
   * Update the state and refresh the user interface.
   */
  set(attr: Partial<State>) {
    Object.assign(this, attr);
    this.render(this);
  }
}