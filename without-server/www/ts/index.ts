import { View } from './view.js';
import { State, Page } from './state.js';
import { SubscriptionService } from './subscription-service.js';

// declare var cordova: any;
// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

class App {

  view: View;
  state: State;
  subscriptionService: SubscriptionService;

  constructor() {
    this.view = new View();
    this.state = new State(state => this.view.render(state));
    this.subscriptionService = new SubscriptionService(CdvPurchase.store, this.state);
  }

  initialize() {
    this.subscriptionService.initialize();
  }

  subscribe(platform: CdvPurchase.Platform, productId: string, offerId: string) {
    this.subscriptionService.subscribe(platform, productId, offerId);
  }

  open(page: Page) {
    this.state.set({ page });
  }
}

// Singleton
declare global {
  interface Window {
    app: App;
  }
}

// Initialize the app
function onDeviceReady() {
  window.app = new App();
  window.app.initialize();
}