/**
 * Pushdy Messaging module for this example app
 *
 * This is the development example
 * You can use this file as Pushdy wrapper service for you app
 * Replace NavigationService by your navigation service
 */
import Pushdy, { PushdyNotification } from 'react-native-pushdy'
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
    Pushdy.setTimeout(20000);

    // Pushdy.setDeviceId('1234567890');
    await Pushdy.initPushdy({
      clientKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OTQ0NTMyNTU5NiIsImFwcF9pZCI6InJlYWN0X25hdGl2ZV9wdXNoZHlfZXhhbXBsZSIsImlhdCI6MTU3NTU0MDM0NX0.Dt81jYANo4QzV_q8JhZxfSTzq44SivUa-yCwPteyCiE",
      // deviceId: '123456789_',
    });

    const [msg, x2num] = await Pushdy.sampleMethod('Hello from JS with', 500);
    this.debug && this.log.debug('{register} msg, x2num: ', msg, x2num);


    // Remember to subscribe first
    // On android: You must call this fn, at least with no params: Pushdy.startSubscribers();
    const _this = this;
    Pushdy.startSubscribers({
      onNotificationOpened: _this.onNotificationOpened.bind(_this),
      onNotificationReceived: _this.onNotificationReceived.bind(_this),
      onRemoteNotificationFailedToRegister: _this.onRemoteNotificationFailedToRegister.bind(_this),
      onRemoteNotificationRegistered: _this.onRemoteNotificationRegistered.bind(_this),
      onTokenUpdated: _this.onTokenUpdated.bind(_this),
    });

    // You must ensure permission before you can receive push
    this.ensurePermission().then(enabled => {
      Pushdy.getDeviceToken().then((deviceToken) => {
        if (deviceToken) {
          this.handleTokenUpdated(deviceToken);
        } else {
          this.log.info('deviceToken is empty: ', deviceToken);
        }
      });
    });

    // After setting up subscribers, you can continue to work with Pushdy
    this.handleInitialNotification();
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
    const enabled = await Pushdy.isNotificationEnabled();
    if (enabled) {
      // user has permissions
      this.debug && this.log.info('{ensurePermission} user has permissions');
      return true;
    } else {
      this.debug && this.log.info('{ensurePermission} user does not have permissions');

      /**
       * Case 1: First time app open => Show a native popup and user can choose Allow / Disallow
       * Case 2: Second open app => OS doesn't support tp show native popup again, so we need to warn user, and let they go to OS Setting to turn on notification
       */
      // user doesn't have permission
      if (showAccquireOSSettingPopup) {
        setTimeout(() => {
          // Show non-blocking request
          this.showRequestOsSettingPermissionPopup();
        }, 0);
      }

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
   * @param {PushdyNotification} notification
   * @param {String} fromState
   */
  onNotificationOpened({notification, fromState}) {
    this.debug && this.log.info('{onNotificationOpened} event: ', {notification, fromState});
    this.handleMyAppPushAction(notification, fromState);
  }

  /**
   * Handle notification received in foreground
   *  - In case of enablePushdyInAppBanner(true): PushdySDK already have implemented a default app banner
   *  - In case of enablePushdyInAppBanner(false): TODO: Check this case
   *
   * You can handle and show your in-app banner here
   *
   * @param {PushdyNotification} notification
   * @param {String} fromState
   */
  onNotificationReceived({notification, fromState}) {
    this.debug && this.log.info('{onNotificationReceived} event: ', {notification, fromState});
  }

  onRemoteNotificationFailedToRegister(event) {
    this.debug && this.log.info('{onRemoteNotificationFailedToRegister} event: ', event);
  }

  onRemoteNotificationRegistered(event) {
    this.debug && this.log.info('{onRemoteNotificationRegistered} event: ', event);
  }

  /**
   * When your app is in closed state (not background), incomming notification message will be handled and show by OS, you can find it in the OS's notification center
   * Then user press the notification, the app will be opened with that notification data, that data called pendingPushNotification
   *
   * After JS thread was ready, PushdySDK was ready, you need to check if there is a pendingPushNotification
   * and handle it
   *
   * In some other SDK, pendingPushNotifications also known as initialNotifications
   */
  async handleInitialNotification() {
    // Get the clicked push notification while app is closed
    const pendingNotification = await Pushdy.getPendingNotification();
    this.debug && this.log.info('{handleInitialNotification} pendingNotification: ', pendingNotification);

    if (pendingNotification) {
      this.handleMyAppPushAction(pendingNotification, "closed");
    }
  }

  /**
   * ======== App specific behavior ========
   */
  handleMyAppPushAction(notification, fromState) {
    this.debug && this.log.info("[handleMyAppPushAction] notification, fromState", notification, fromState);

    const data = notification.data;
    let pushData = data ? data.push_data : {};
    if (typeof pushData === 'string') {
      pushData = JSON.parse(pushData);
    }
    const action = data.push_action;

    switch (action) {
      /*
      POST https://api.pushdi.com/notification with raw body bellow:
      {
        "id": "",
        "status": "waiting",
        "platforms": ["ios", "android"],
        "segment_ids": [],
        "campaign_ids": [],
        "filters": [
          {
            "field": "device_token",
            "value": "77B7BA310E95397DCADFD6DAC86B919BE17FFCB4466465A26BCA8FCECF4ACF96",
            "relation": "="
          }
        ],

        "priority": "high",
        "mutable-content": 1,

        "headings": "Anh Vượng dự định bán tivi",
        "contents": "Hãng xe tỷ phú Phạm Nhật Vượng vừa có thoả thuận lịch sử, lại rò rỉ tin mới về tivi. Hãng xe tỷ phú Phạm Nhật Vượng vừa có thoả thuận lịch sử, lại rò rỉ tin mới về tivi. Hãng xe tỷ phú Phạm Nhật Vượng vừa có thoả thuận lịch sử, lại rò rỉ tin mới về tivi",
        "image": "https://znews-photo.zadn.vn/w660/Uploaded/cqdhmdxwp/2019_08_14/kuncherry90_67233597_965480387137244_1646091755794003933_n_copy.jpg",

        "data": {
          "push_action": "nav_to_article_detail",
          "push_data": {
              "article_id": 179269
          },

          "title": "Bão số 6 hướng đi khó lường",
          "body": "Ít nhất 7 tỉnh thành sẽ bị ảnh hưởng, cần sẵn sàng tinh thần ứng phó",
          "image": "https://vortex.accuweather.com/adc2010/images/icons-numbered/01-l.png"
        },
        "player_ids": [],
        "type": "mobile_push",
        "tags": ["test"]
      }
       */
      case 'nav_to_article_detail':
        NavigationService.navigate('ArticleDetail', {
          article_id: pushData.article_id,
          ts: +(new Date),
          title: notification.title,
          body: notification.body,
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
