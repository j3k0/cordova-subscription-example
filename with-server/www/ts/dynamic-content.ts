import { State } from "./state.js";
import { REMOTE_SERVER } from "./configuration.js";

function endpoint(path: string) { return REMOTE_SERVER + path; }

export interface ServerContent {
  title?: string;
  content?: string;
  error?: string;
}

export interface ServerTokenProvider {
  token?: string;
  onLogout(callback: VoidFunction): void;
}

export class DynamicContent {

  logger: CdvPurchase.Logger;
  state: State;
  session: ServerTokenProvider;

  constructor(state: State, session: ServerTokenProvider) {
    this.state = state;
    this.session = session;
    this.session.onLogout(() => this.clearContent());
    this.logger = new CdvPurchase.Logger({ verbosity: CdvPurchase.LogLevel.DEBUG }, 'DynamicContent');
  }

  clearContent() {
    this.logger.debug('clearContent');
    this.state.set({
      freeContent: undefined,
      premiumContent: undefined,
    });
  }

  reloadContent() {
    this.logger.debug('reloadContent');
    this.state.set({ freeContentLoading: true, premiumContentLoading: true });

    this.loadContent('public/1', (err, freeContent) => {
      if (err) {
        this.logger.debug('reloadContent public: error: ' + err);
        this.state.set({
          freeContentLoading: false,
          freeContent: {
            title: 'ERROR',
            content: err,
          }
        });
      }
      else {
        this.logger.debug('reloadContent public: success');
        this.state.set({ freeContentLoading: false, freeContent });
      }
    });

    this.loadContent('protected/1', (err, premiumContent) => {
      if (err) {
        this.logger.debug('reloadContent protected: error: ' + err);
        this.state.set({
          premiumContentLoading: false,
          premiumContent: {
            title: 'ERROR',
            content: err,
          }
        });
      }
      else {
        this.logger.debug('reloadContent protected: success');
        this.state.set({ premiumContentLoading: false, premiumContent });
      }
    });
  }

  private loadContent(id: string, callback: (err?: string, content?: ServerContent) => void) {
    this.logger.debug('loadContent: ' + id);
    CdvPurchase.Utils.ajax<ServerContent>(this.logger, {
      url: endpoint('/content/' + id + '?token=' + this.session.token),
      method: 'GET',
      success: body => {
        this.logger.debug('loadContent: success');
        callback(undefined, body);
      },
      error: (statusCode, statusText, data) => {
        this.logger.debug('loadContent: error: ' + statusText);
        callback(statusText);
      },
    })
  }
}