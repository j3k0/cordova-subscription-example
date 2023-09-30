import { State } from '../state.js';
import { HTML } from '../html.js';

export class Layout {

  static rootLayout(content: string, state: State) {
    const contentString = HTML.div(content, { className: "w3-container" });
    if (state.error) {
      return HTML.toString([
        HTML.div(
          HTML.div('ERROR: ' + state.error, { className: 'w3-panel w3-red' }),
          { className: "w3-container" }),
        contentString,
      ]);
    }
    else {
      return contentString;
    }
  }

  static menuLayout(content: string, state: State) {
    return Layout.rootLayout(HTML.toString([
      Layout.menu(),
      HTML.div(content)
    ]), state);
  }

  private static menu(): string {
    return HTML.div([
      HTML.button('Content', {
        onclick: () => window.app.open('home'),
        className: "w3-button"
      }),
      HTML.button('Store', {
        onclick: () => window.app.open('store'),
        className: "w3-button"
      })
    ], {
      className: 'w3-container w3-black w3-padding-small'
    });
  }
}