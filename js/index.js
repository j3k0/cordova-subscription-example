import { View } from './view.js';
import { State } from './state.js';
import { SubscriptionService } from './subscription-service.js';
// declare var cordova: any;
// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);
class App {
    constructor() {
        this.view = new View();
        this.state = new State(state => this.view.render(state));
        this.subscriptionService = new SubscriptionService(CdvPurchase.store, this.state);
    }
    initialize() {
        this.subscriptionService.initialize();
    }
    subscribe(platform, productId, offerId) {
        this.subscriptionService.subscribe(platform, productId, offerId);
    }
    open(page) {
        this.state.set({ page });
    }
}
// Initialize the app
function onDeviceReady() {
    window.app = new App();
    window.app.initialize();
}
