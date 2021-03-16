import { WebPlugin } from "@capacitor/core";

import { FirebaseAnalyticsPlugin, FirebaseInitOptions } from "./definitions";

declare var window: any;

// Errors
const ErrFirebaseAnalyticsMissing = new Error(
  "Firebase analytics is not initialized. Make sure initializeFirebase() is called once"
);
const ErrOptionsMissing = new Error("Firebase options are missing");

// Firebase Library Version
const FIREBASE_VERSION = "8.3.0";

export class FirebaseAnalyticsWeb extends WebPlugin
  implements FirebaseAnalyticsPlugin {
  public readonly ready: Promise<any>;
  private readyResolver: Function;
  private analyticsRef: any;

  private scripts = [
    {
      key: "firebase-app",
      src: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`,
    },
    {
      key: "firebase-ac",
      src: `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-analytics.js`,
    },
  ];

  constructor() {
    super({
      name: "FirebaseAnalytics",
      platforms: ["web"],
    });

    this.ready = new Promise((resolve) => (this.readyResolver = resolve));
    this.loadScripts();
  }

  /**
   * Sets the user ID property.
   * @param options - userId: unique identifier of the user to log
   * Platform: Web/Android/iOS
   */
  async setUserId(options: { userId: string }): Promise<void> {
    await this.ready;

    if (!this.analyticsRef) throw ErrFirebaseAnalyticsMissing;
    if (!options?.userId) throw new Error("userId property is missing");

    this.analyticsRef.setUserId(options.userId);
    return;
  }

  /**
   * Sets a user property to a given value.
   * @param options - name: The name of the user property to set.
   *                  value: The value of the user property.
   * Platform: Web/Android/iOS
   */
  async setUserProperty(options: {
    name: string;
    value: string;
  }): Promise<void> {
    await this.ready;

    if (!this.analyticsRef) throw ErrFirebaseAnalyticsMissing;

    const { name, value } = options || { name: undefined, value: undefined };

    if (!name) throw new Error("name property is missing");

    if (!value) throw new Error("value property is missing");

    let property: any = {};
    property[name] = value;
    this.analyticsRef.setUserProperties(property);
    return;
  }

  /**
   * Retrieves the app instance id from the service.
   * @returns - instanceId: current instance if of the app
   * Platform: Web/Android/iOS
   */
  getAppInstanceId(): Promise<{ instanceId: string }> {
    return new Promise((resolve, _reject) => resolve);
  }

  /**
   * Sets the current screen name, which specifies the current visual context in your app.
   * @param options - screenName: the activity to which the screen name and class name apply.
   *                  nameOverride: the name of the current screen. Set to null to clear the current screen name.
   * Platform: Android/iOS
   */
  setScreenName(_options: {
    screenName: string;
    nameOverride: string;
  }): Promise<void> {
    return new Promise((resolve, _reject) => resolve);
  }

  /**
   * Clears all analytics data for this app from the device and resets the app instance id.
   * Platform: Android/iOS
   */
  reset(): Promise<void> {
    return new Promise((resolve, _reject) => resolve);
  }

  /**
   * Logs an app event.
   * @param options - name: unique name of the event
   *                  params: the map of event parameters.
   * Platform: Web/Android/iOS
   */
  async logEvent(options: { name: string; params: object }): Promise<void> {
    await this.ready;

    if (!this.analyticsRef) throw ErrFirebaseAnalyticsMissing;

    const { name, params } = options || {
      name: undefined,
      params: undefined,
    };

    if (!name) throw new Error("name property is missing");

    this.analyticsRef.logEvent(name, params);
    return;
  }

  /**
   * Sets whether analytics collection is enabled for this app on this device.
   * @param options - enabled: boolean true/false to enable/disable logging
   * Platform: Web/Android/iOS
   */
  async setCollectionEnabled(options: { enabled: boolean }): Promise<void> {
    await this.ready;

    if (!this.analyticsRef) throw ErrFirebaseAnalyticsMissing;

    const { enabled = false } = options;
    this.analyticsRef.setAnalyticsCollectionEnabled(enabled);
    return;
  }

  /**
   * Returns analytics reference object
   */
  get remoteConfig() {
    return this.analyticsRef;
  }

  async enable(): Promise<void> {
    await this.ready;

    if (!this.analyticsRef) throw ErrFirebaseAnalyticsMissing;

    this.analyticsRef.setAnalyticsCollectionEnabled(true);
    return;
  }

  async disable(): Promise<void> {
    await this.ready;

    if (!this.analyticsRef) throw ErrFirebaseAnalyticsMissing;

    this.analyticsRef.setAnalyticsCollectionEnabled(false);
    return;
  }

  /**
   * Configure and Initialize FirebaseApp if not present
   * @param options - web app's Firebase configuration
   * @returns firebase analytics object reference
   * Platform: Web
   */
  async initializeFirebase(options: FirebaseInitOptions): Promise<any> {
    if (!options) throw ErrOptionsMissing;

    await this.firebaseObjectReadyPromise();
    const app = this.isFirebaseInitialized()
      ? window.firebase
      : window.firebase.initializeApp(options);
    this.analyticsRef = app.analytics();
    this.readyResolver();
    return this.analyticsRef;
  }

  /**
   * Check for existing loaded script and load new scripts
   */
  private loadScripts(): Promise<Array<any>> {
    return Promise.all(this.scripts.map((s) => this.loadScript(s.key, s.src)));
  }

  /**
   * Loaded single script with provided id and source
   * @param id - unique identifier of the script
   * @param src - source of the script
   */
  private loadScript(id: string, src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve(null);
      } else {
        const file = document.createElement("script");
        file.type = "text/javascript";
        file.src = src;
        file.id = id;
        file.onload = resolve;
        file.onerror = reject;
        document.querySelector("head").appendChild(file);
      }
    });
  }

  private firebaseObjectReadyPromise(): Promise<void> {
    var tries = 100;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (window.firebase?.analytics) {
          clearInterval(interval);
          resolve(null);
        } else if (tries-- <= 0) {
          reject("Firebase fails to load");
        }
      }, 50);
    });
  }

  private isFirebaseInitialized() {
    const length = window.firebase?.apps?.length;
    return length && length > 0;
  }
}

const FirebaseAnalytics = new FirebaseAnalyticsWeb();

export { FirebaseAnalytics };

import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(FirebaseAnalytics);
