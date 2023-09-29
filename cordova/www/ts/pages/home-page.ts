import {State} from '../state.js';
import {HTML} from '../html.js';
import {Layout} from './layout.js';

export class HomePage {

  static render(state: State) {
    return Layout.menuLayout(HTML.div([
      HTML.div([
        HTML.h2('FREE'),
        HTML.p('Free content: 🍫'),
      ], { className: "w3-container w3-section w3-blue" }),
      HTML.div([
        HTML.h2('PREMIUM'),
        HTML.p(HomePage.premiumContent(state)),
      ], { className: "w3-container w3-section w3-black" }),
    ]), state);
  }

  static premiumContent(state:State): string {
    if (state.activeSubscription)
      return 'You are a premium user. Here is the premium content: 🥳';
    if (!state.ready || state.isVerifying)
      return 'Loading subscription status... Please wait...';
    return HTML.button("Subscribe to Access", {
      onclick: () => window.app.open('store'),
      className: "w3-button w3-red"
    });
  }
}