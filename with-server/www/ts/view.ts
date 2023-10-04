import { HTML } from './html.js';
import { Page, State } from './state.js';
import { HomePage } from './pages/home-page.js';
import { StorePage } from './pages/store-page.js';
import { LoginPage } from './pages/login-page.js';

/**
 * Renders HTML when the application State changes
 */
export class View {

  /**
   * Replace the page's body with dynamic HTML content.
   */
  render(state: State) {
    const body = document.getElementsByTagName('body')[0];
    const isLoading = state.isRestoringSession || state.isProcessingOrder || state.isRefreshing || state.isLogin;
    if (isLoading) {
      body.innerHTML = this.loadingPage();
    }
    else {
      body.innerHTML = this.mainContent(state);
    }
  }

  loadingPage() {
    return HTML.div(
      HTML.img('', { src: "img/loading.gif" }),
      {
        className: "w3-container w3-black w3-padding-64 w3-center",
        style: "position: absolute; height: 100%; width: 100%;",
      }
    );
  }

  mainContent(state: State) {
    if (!state.sessionReady) {
      return LoginPage.render(state);
    }
    switch (state.page) {
      case 'home':
        return HomePage.render(state);
      case 'store':
        return StorePage.render(state);
    }
  }
}