/**
 * Pushdy Messaging module for this example app
 *
 * This is the development example
 * You can use this file as Pushdy wrapper service for you app
 * Replace NavigationService by your navigation service
 */
import Pushdy from 'react-native-pushdy'
import { Platform, Alert, NativeEventEmitter } from "react-native";
import OpenAppSettings from 'react-native-app-settings';

import ColorLog from '../ColorLog'

/**
 * Use react-navigation library as app router
 */
import NavigationService from '../NavigationService'


class PushdyMessaging {
  debug = true;
  log = new ColorLog({}, {prefix: '[PushdyMessaging] '});

  async register() {
    /**
     * See more at: https://pushdy_document
     */
    Pushdy.setTimeout(5000);

    const [msg, x2num] = await Pushdy.sampleMethod('Hello from JS with', 500);
    console.log('{register} msg, x2num: ', msg, x2num);

    if (Platform.OS === 'ios') {
      await Pushdy.ios_registerForPushNotification();
    }

    // Remember to subscribe first
    const _this = this;
    Pushdy.startSubscribers({
      onNotificationOpened: _this.onNotificationOpened.bind(_this),
      onNotificationReceived: _this.onNotificationReceived.bind(_this),
      onRemoteNotificationFailedToRegister: _this.onRemoteNotificationFailedToRegister.bind(_this),
      onRemoteNotificationRegistered: _this.onRemoteNotificationRegistered.bind(_this),
      onTokenUpdated: _this.onTokenUpdated.bind(_this),
    });

    // After setting up subscribers, you can continue to work with Pushdy
    Pushdy.getDeviceToken().then((deviceToken) => {
      // console.log('{PushdyMessaging} deviceToken: ', deviceToken);
      if (deviceToken) {
        this.handleTokenUpdated(deviceToken);
      } else {
        this.log.info('deviceToken is empty: ', deviceToken);
      }
    });
  }

  unregister() {
    Pushdy.stopSubscribers();
  }


  /**
   * Check and request permission if user has not granted
   * Or request user to turn on notification in OS Setting menu
   *
   * @returns {Promise<void>}
   */
  async ensurePermission(showAccquireOSSettingPopup = false) {
    return;

    const enabled = await Pushdy.isNotificationEnabled();
    if (enabled) {
      // user has permissions
      this.debug && this.log.info('{ensurePermission} user has permissions');
      return true;
    } else {
      // https://guide.pushdy.com/i/cai-dat-mobile-push/ios#3-cai-dat-sdk-cho-ios-app
      // The OS dialog was show only once => Case 1 bellow
      // If user turn push-noti off => case 2 bellow
      await Pushdy.ios_registerForPushNotifications();

      /**
       * Case 1: First time app open => Show a native popup and user can choose Allow / Disallow
       * Case 2: Second open app => OS doesn't support tp show native popup again, so we need to warn user, and let they go to OS Setting to turn on notification
       */
      // user doesn't have permission
      setTimeout(() => {
        // Show non-blocking request
        if (showAccquireOSSettingPopup) {
          this.showRequestOsSettingPermissionPopup();
        }
      }, 0);

      return false;
    }
  }

  /**
   * Try to check if user have enabled push permission or not.
   * If not -> show a popup to confirm
   */
  accquireOSSettingIfNeeded() {
    this.ensurePermission(true);
  }

  /**
   * Trigger event to show popup in AppContainer
   */
  showRequestOsSettingPermissionPopup() {
    // Works on both Android and iOS
    Alert.alert(
      'Permission needed',
      'Push permission is required to receive notification',
      [{
        text: 'Cancel',
        style: 'cancel',
      }, {
        text: 'OK',
        onPress: () => OpenAppSettings.open(),
      }],
      { cancelable: false },
    );
  }

  handleTokenUpdated(deviceToken) {
    this.debug && this.log.info('{onTokenUpdated} deviceToken: ', deviceToken);

    if (deviceToken) {
      // Do sth like Save token to localStorage
    } else {
      this.debug && this.log.info('{onTokenUpdated} Skip because deviceToken is null', deviceToken);
    }
  }

  /**
   * @param event Format: {deviceToken}
   */
  onTokenUpdated({ deviceToken }) {
    this.handleTokenUpdated(deviceToken);
  }

  /**
   * Notification was opened from
   * @param notification
   * @param fromState
   */
  onNotificationOpened({notification, fromState}) {
    console.log('{onNotificationOpened} event: ', {notification, fromState});

    this.handleMyAppPushAction(notification, fromState);
  }

  onNotificationReceived({notification, fromState}) {
    console.log('{onNotificationReceived} event: ', {notification, fromState});
  }

  onRemoteNotificationFailedToRegister(event) {
    console.log('{onRemoteNotificationFailedToRegister} event: ', event);
  }

  onRemoteNotificationRegistered({}) {}


  /**
   * ======== App specific behavior ========
   */
  handleMyAppPushAction(notification, fromState) {
    const action = notification.push_action;
    const data = notification.data;
    const pushData = data ? data.push_data : {};

    switch (action) {
      case 'nav_to_article_detail':
        NavigationService.navigate('ArticleDetail', {
          article_id: pushData.article_id,
          ts: +(new Date),
          title: data.title,
          body: data.body,
        });
        break;
      case 'nav_to_hello_world':
        NavigationService.navigate('HelloWorld', {
          foo: '123456789',
          ts: +(new Date),
        });
        break;
      default:
        console.error('Unhandled push action: ', action)
    }
  }
}

export default new PushdyMessaging();
