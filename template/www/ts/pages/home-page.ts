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
    ]), state);
  }
}