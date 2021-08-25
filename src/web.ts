import { registerPlugin, WebPlugin } from "@capacitor/core";
import firebase from "firebase";
import "firebase/analytics";
import type { FirebaseAnalyticsPlugin } from "./definitions";

export class FirebaseAnalyticsWeb
  extends WebPlugin
  implements FirebaseAnalyticsPlugin
{
  private analyticsRef: firebase.analytics.Analytics;

  constructor() {
    super();
  }

  async initializeFirebase(app: firebase.app.App) {
    this.analyticsRef = app.analytics();
  }

  /**
   * Sets the user ID property.
   * @param options - userId: unique identifier of the user to log
   * Platform: Web/Android/iOS
   */
  async setUserId(options: { userId: string }): Promise<void> {
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
    const { enabled = false } = options;
    this.analyticsRef.setAnalyticsCollectionEnabled(enabled);
    return;
  }

  async enable(): Promise<void> {
    this.analyticsRef.setAnalyticsCollectionEnabled(true);
    return;
  }

  async disable(): Promise<void> {
    this.analyticsRef.setAnalyticsCollectionEnabled(false);
    return;
  }
}

const FirebaseAnalytics = registerPlugin<FirebaseAnalyticsWeb>(
  "FirebaseAnalytics",
  {
    web: () => new FirebaseAnalyticsWeb(),
  }
);

export { FirebaseAnalytics };
