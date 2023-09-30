export type Page = 'home' | 'store';

/**
 * The application state.
 */
export class State {

  page: Page = 'home';
  error: string = '';
  loading: boolean = false;

  render: (state: State) => void;
  constructor(render: (state: State) => void) {
    this.render = render;
  }

  /**
   * Update the state and refresh the user interface.
   */
  set(attr: Partial<State>) {
    Object.assign(this, attr);
    this.render(this);
  }
}