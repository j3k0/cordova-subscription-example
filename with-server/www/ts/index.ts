import { View } from './view.js';
import { State, Page } from './state.js';
import { SubscriptionService } from './subscription-service.js';
import { Session } from './session.js';
import { DynamicContent } from './dynamic-content.js';

// declare var cordova: any;
// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

class App {

  view: View;
  state: State;
  subscriptionService: SubscriptionService;
  session: Session;
  dynamicContent: DynamicContent;
  logger: CdvPurchase.Logger;

  constructor() {
    this.view = new View();
    this.state = new State(state => this.view.render(state));
    this.session = new Session(this.state);
    this.subscriptionService = new SubscriptionService(CdvPurchase.store, this.state, this.session, () => this.session.session?.username);
    this.dynamicContent = new DynamicContent(this.state, this.session);
    this.logger = new CdvPurchase.Logger({ verbosity: CdvPurchase.LogLevel.DEBUG }, 'App');
  }

  initialize() {
    this.view.render(this.state);
    this.logger.debug('initialize');
    this.session.initialize(error => {
      this.logger.debug('session ready');
      this.dynamicContent.reloadContent();
      this.subscriptionService.initialize();
      this.subscriptionService.onVerified(() => {
        this.logger.debug('subscriptionService.onVerified');
        this.session.update();
      });
    });
  }

  subscribe(platform: CdvPurchase.Platform, productId: string, offerId: string) {
    this.logger.debug('subscribe: ' + platform + ' ' + productId + ' ' + offerId);
    this.subscriptionService.subscribe(platform, productId, offerId);
  }

  open(page: Page) {
    this.logger.debug('open: ' + page);
    // refresh to-be opened page content
    switch (page) {
      case 'home':
        this.dynamicContent.reloadContent();
        break;
      case 'store':
        if (this.state.subscriptionServiceReady) {
          this.subscriptionService.update();
        }
        break;
    }

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