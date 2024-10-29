import {State} from '../state.js';
import {HTML} from '../html.js';
import {Layout} from './layout.js';

export class HomePage {

  static render(state: State) {
    if (state.isWaitingForWebhook) {
      return Layout.menuLayout(HTML.div('Please wait: PROCESSING YOUR PURCHASES...', { className: "w3-panel w3-orange" }), state);
    }
    return Layout.menuLayout(HTML.div([
      HTML.div([
        HTML.h2([
          state.freeContent?.title?.toLocaleUpperCase() || '...',
          state.freeContentLoading ? ' ⏳' : null,
        ]),
        HTML.p(state.freeContent?.content || state.freeContent?.error || '...'),
      ], { className: "w3-container w3-section w3-blue" }),
      HTML.div([
        HTML.h2([
          state.premiumContent?.title?.toLocaleUpperCase() || 'PREMIUM',
          state.premiumContentLoading ? ' ⏳' : null,
        ]),
        HTML.p(state.premiumContent?.content || this.errorToString(state.premiumContent?.error)),
      ], { className: "w3-container w3-section w3-black" }),
    ]), state);
  }

  static errorToString(error?: string) {
    if (!error) return null;
    if (error === 'NoSubscription') return HomePage.subscribeToAccess();
    return error;
  }

  static subscribeToAccess(): string {
    return HTML.button("Subscribe to Access", {
      onclick: () => window.app.open('store'),
      className: "w3-button w3-red"
    });
  }
}