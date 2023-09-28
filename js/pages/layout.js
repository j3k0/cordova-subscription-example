import { HTML } from '../html.js';
export class Layout {
    static rootLayout(content, state) {
        const contentString = HTML.div(content, { className: "w3-container" });
        if (state.error) {
            return HTML.toString([
                HTML.div(HTML.div('ERROR: ' + state.error, { className: 'w3-panel w3-red' }), { className: "w3-container" }),
                contentString,
            ]);
        }
        else {
            return contentString;
        }
    }
    static menuLayout(content, state) {
        return Layout.rootLayout(HTML.toString([
            Layout.menu(),
            HTML.div(content)
        ]), state);
    }
    static menu() {
        return HTML.div([
            HTML.button('Content', { onclick: "app.open('home')", className: "w3-button" }),
            HTML.button('Store', { onclick: "app.open('store')", className: "w3-button" })
        ], { className: 'w3-container w3-black w3-padding-small' });
    }
}
