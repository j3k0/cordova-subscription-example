export type Page = 'home' | 'store';

/**
 * The application state.
 */
export class State {

  page: Page = 'home';
  ready: boolean = false;
  error: string = '';
  isProcessingOrder: boolean = false;
  isVerifying: boolean = false;

  activeSubscription?: CdvPurchase.VerifiedPurchase;
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