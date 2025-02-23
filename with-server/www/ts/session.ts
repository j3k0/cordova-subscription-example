import { State } from "./state.js";
import { REMOTE_SERVER } from "./configuration.js";

function endpoint(path: string) { return REMOTE_SERVER + path; }

export type SessionError = 'NETWORK_ERROR' | 'SERVER_ERROR';
const statusErrors: { [code: string]: SessionError } = {
  '500': 'SERVER_ERROR',
}


export interface ServerSubscription {
  username: string;
  isActive: boolean;
  isExpired: boolean;
  expirationDate: string;
  purchase?: CdvPurchase.VerifiedPurchase;
}

export interface ServerSession {
  token: string;
  username: string;
  subscription: ServerSubscription;
  isWaitingForWebhook: boolean;
}

interface LoginResponse {
  token: string;
}

export class Session {

  state: State;
  token?: string;
  session?: ServerSession;
  logger: CdvPurchase.Logger;

  constructor(state: State) {
    this.state = state;
    this.logger = new CdvPurchase.Logger({verbosity: CdvPurchase.LogLevel.DEBUG}, 'Session');
  }

  private onSessionReady?: (error: null) => void;

  initialize(callback: (error: SessionError | null) => void) {
    this.restoreToken();
    if (this.token) {
      this.state.set({ isRestoringSession: true });
      this.logger.debug('initialize: ' + this.token);
      this.update(callback);
    }
    else {
      this.logger.debug('initialize: no token');
      this.onSessionReady = callback;
    }
  }

  private saveToken(token: string | undefined) {
    if (token) {
      window.localStorage['session_token'] = token;
    }
    else {
      delete window.localStorage['session_token'];
    }
    this.token = token;
  }

  private restoreToken() {
    this.token = window.localStorage['session_token'];
  }

  login(username: string, callback?: (error: SessionError | null) => void) {
    this.logger.debug('login: ' + username);
    this.state.set({ isLogin: true, username });
    CdvPurchase.Utils.ajax<LoginResponse>(this.logger, {
      url: endpoint('/login'),
      method: 'POST',
      data: { username },
      success: body => {
        this.logger.debug('/login success: ' + body.token);
        this.saveToken(body.token);
        this.update(callback);
      },
      error: (statusCode, statusText, data) => {
        this.logger.error('/login error: ' + statusText);
        this.state.set({ isLogin: true });
        if (callback) callback(statusErrors[statusCode] ?? 'NETWORK_ERROR');
      },
    });
  }

  hasWebhookWatcher: boolean = false;

  update(callback?: (error: SessionError | null) => void) {
    const doUpdate = (isWebhookWatcher: boolean, callback?: (error: SessionError | null) => void) => {
      this.logger.debug('update');
      if (!this.token) {
        this.session = undefined;
        this.state.set({ isLogin: true });
        if (callback) callback(null);
        return;
      }
      CdvPurchase.Utils.ajax<ServerSession>(this.logger, {
        url: endpoint('/me?token=' + this.token),
        method: 'GET',
        success: body => {
          this.logger.debug('update: success. ' + JSON.stringify(body, null, 2));
          this.session = body;
          this.saveToken(body.token);
          this.state.set({
            sessionReady: true,
            isLogin: false,
            subscription: this.session.subscription,
            username: this.session.username,
            isRestoringSession: false,
            isWaitingForWebhook: this.session.isWaitingForWebhook,
          });
          if (callback) callback(null);
          if (this.onSessionReady) {
            this.logger.debug('update: calling onSessionReady');
            this.onSessionReady(null);
            this.onSessionReady = undefined;
          }
          if (!this.session.isWaitingForWebhook) {
            this.hasWebhookWatcher = false;
          }
          else if (!this.hasWebhookWatcher || isWebhookWatcher) {
            this.logger.debug('update: pull state until webhook is received...');
            this.hasWebhookWatcher = true;
            // reload session data every 2 seconds, until the webhook is received
            setTimeout(() => {
              this.logger.debug('update: webhook watcher reloading session.');
              doUpdate(true);
            }, 2000);
          }
        },
        error: (statusCode, statusText, data) => {
          this.logger.error('/me error: ' + statusText);
          this.state.set({ sessionReady: true, isLogin: false });
          if (callback) callback(statusErrors[statusCode] ?? 'NETWORK_ERROR');
        },
      });
    };
    doUpdate(false, callback);
  }

  logout() {
    this.logger.debug('logout');
    this.saveToken(undefined);
    this.session = undefined;
    this.state.set({ sessionReady: false, subscription: undefined, username: undefined });
    this.logoutListeners.forEach(callback => callback());
  }

  private logoutListeners: VoidFunction[] = [];
  onLogout(callback: VoidFunction): void {
    this.logoutListeners.push(callback);
  }
}