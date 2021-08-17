import Foundation
import Capacitor
import FirebaseCore
import FirebaseAnalytics


@objc(FirebaseAnalytics)
public class FirebaseAnalytics: CAPPlugin {
    
    public override func load() {
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
    }
    
    
    /// Initializes the firebase app. 
    /// Param call: dismissed
    ///
    /// @web only. 
    /// This is a helper method to provide common APIs accross platforms.
    @objc func initializeFirebase(_ call: CAPPluginCall) {
        call.resolve()
    }
    
    /// Sets the user ID property.
    /// - Parameter call: userId - unique identifier of the user to log
    @objc func setUserId(_ call: CAPPluginCall) {
        guard let userId = call.getString("userId") else {
             call.reject("userId property is missing")
             return
        }
        
        Analytics.setUserID(userId)
        call.resolve()
    }
    
    
    /// Sets a user property to a given value.
    /// - Parameter call: name - The name of the user property to set.
    ///                   value - The value of the user property.
    @objc func setUserProperty(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("name property is missing")
            return
        }
        
        guard let value = call.getString("value") else {
            call.reject("value property is missing")
            return
        }
        
        Analytics.setUserProperty(value, forName: name!)
        call.resolve()
    }
    
    
    /// Retrieves the app instance id from the service.
    /// - Parameter call: instanceId - current instance if of the app
    @objc func getAppInstanceId(_ call: CAPPluginCall) {
        let instanceId = Analytics.appInstanceID()
        call.resolve([
            "instanceId": instanceId
        ])
    }
    
    
    /// Sets the current screen name, which specifies the current visual context in your app.
    /// - Parameter call: screenName - the activity to which the screen name and class name apply.
    ///                   nameOverride - the name of the current screen. Set to null to clear the current screen name.
    @objc func setScreenName(_ call: CAPPluginCall) {
        if let screenName = call.getString("screenName") {
            DispatchQueue.main.async {
                Analytics.logEvent(AnalyticsEventScreenView, parameters: [AnalyticsParameterScreenName: screenName])
            }
            call.resolve()
        } else {
            call.reject("screenName must not be empty or undefined")
        }
    }
    
    
    /// Clears all analytics data for this app from the device and resets the app instance id.
    @objc func reset(_ call: CAPPluginCall) {
        Analytics.resetAnalyticsData()
        call.resolve()
    }
    
    
    /// Logs an app event.
    /// - Parameter call: name - unique name of the event
    ///                   params - the map of event parameters.
    @objc func logEvent(_ call: CAPPluginCall) {
        if let name = call.getString("name") {
            let params = call.getObject("params") ?? nil
            
            Analytics.logEvent(name, parameters: params)
            call.resolve()
        } else {
            call.reject("name property is missing")
        }
    }
    
    
    /// Sets whether analytics collection is enabled for this app on this device.
    /// - Parameter call: enabled - boolean true/false to enable/disable logging
    @objc func setCollectionEnabled(_ call: CAPPluginCall) {
        let enabled: Bool = call.getBool("enabled", false)
        Analytics.setAnalyticsCollectionEnabled(enabled)
        call.resolve()
    }
    
    
    /// Sets the duration of inactivity that terminates the current session.
    /// - Parameter call: duration - duration of inactivity
    @objc func setSessionTimeoutDuration(_ call: CAPPluginCall) {
        let duration = call.getInt("duration") ?? 1800
        Analytics.setSessionTimeoutInterval(TimeInterval(duration))
        call.resolve()
    }

    /// Deprecated - use setCollectionEnabled instead
    /// Enable analytics collection for this app on this device.
    /// - Parameter call
    @available(*, deprecated, renamed: "setCollectionEnabled")
    @objc func enable(_ call: CAPPluginCall) {
        Analytics.setAnalyticsCollectionEnabled(true)
        call.resolve()
    }
  
    /// Deprecated - use setCollectionEnabled instead
    /// Disable analytics collection for this app on this device.
    /// - Parameter call
    @available(*, deprecated, renamed: "setCollectionEnabled")
    @objc func disable(_ call: CAPPluginCall) {
        Analytics.setAnalyticsCollectionEnabled(false)
        call.resolve()
    }
}
