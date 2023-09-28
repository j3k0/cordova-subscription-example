/**
 * The application state.
 */
export class State {
    constructor(render) {
        this.page = 'home';
        this.ready = false;
        this.error = '';
        this.isProcessingOrder = false;
        this.isVerifying = false;
        this.products = [];
        this.purchases = [];
        this.transactions = [];
        this.render = render;
    }
    /**
     * Update the state and refresh the user interface.
     */
    set(attr) {
        Object.assign(this, attr);
        this.render(this);
    }
}
