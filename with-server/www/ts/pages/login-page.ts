import {State} from '../state.js';
import {HTML} from '../html.js';
import {Layout} from './layout.js';

export class LoginPage {

  static render(state: State) {
    return Layout.rootLayout(HTML.div([
      HTML.div([
        HTML.h2('LOGIN', { className: 'w3-blue' }),
        HTML.div('Please login to use this application (password is not required).', { className: "w3-section" }),
        HTML.div([
          HTML.label('Username'),
          HTML.input('', { type: 'text', id: 'username', className: "w3-input w3-border", value: state.username }),
        ], { className: "w3-section" }),
        HTML.div([
          HTML.button('Login', {
            onclick: ev => {
              var username = (window.document.getElementById('username') as HTMLInputElement).value;
              window.app.session.login(username);
            },
            className: 'w3-button w3-blue',
          })
        ], { className: "w3-section" })
      ], { className: "w3-container w3-center" }),
    ], { className: "w3-card-4 w3-margin-64 w3-section" }), state);
  }
}