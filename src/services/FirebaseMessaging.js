/**
 * Luatnd: react-native-firebase wrapper service for t19 app
 */
import firebase, { Notification } from 'react-native-firebase';
import { Platform } from "react-native";
import OpenAppSettings from 'react-native-app-settings';

import AppData from 'STORAGES_PATH/AppData'; // LocalStorage
import Constant from '~/common/Constant';
import APIManager from 'MANAGERS_PATH/APIManager';
import ColorLog from '~/services/ColorLog'
import EventBus from '~/services/EventBus'
import NotificationHelper from 'HELPERS_PATH/NotificationHelper';
import LifeCycleManager from 'MANAGERS_PATH/LifeCycleManager';
import { I18n } from 'MANAGERS_PATH/LocalizationManager';

// import * as TelegramBot from '~/services/TelegramBot'
// TelegramBot.setEnable(false);
// TelegramBot.setChatIds([TelegramBot.TelegramChatIds.Neo]);
// TelegramBot.sendMessage('\n\n=== Session start ===');

/*
FCM payload = {
  "to": "{{fcm_token_aquos}}",
  "priority": "high", // Android need it to show in background wakeup
  "mutable-content": true, // ios need it to show rich push notification
  "time_to_live": 259200,

  //
  // carnivalRichNotificationAttachments:(UNMutableNotificationContent *)originalContent
  // NSString *imageURL = originalContent.userInfo[@"image"];
  //
  "data": {
    "title": "",  // for read it in foreground
    "body": "",   // for read it in foreground
    "_nms_image": "https://a.png", // for read it in foreground


    "media_type": "image", // might be firebase sdk field => check it later ==> No, it's 24h's Soccer field, will remove it
    "message": "??", // might be firebase sdk field => check it later
    "attachment": "https://vortex.accuweather.com/adc2010/images/icons-numbered/01-l.png" // might be firebase sdk field => check it later
  },
  "notification": {
	  "image_url": "https://...", // will be @originalContent.userInfo[@gcm.notification.image_url]" => It's firebase service field => We don't need it

  	"android_channel_id": "news",
    "sound": "default",
    "title": "",
    "body": "",

    // Android OS notification bigPicture, no effect for iOS
    "image": "https://vortex.accuweather.com/adc2010/images/icons-numbered/01-l.png"
  }
}

APNS_Payload = {
   "aps" : {
      "alert" : {
         "title" : "Game Request",
         "body" : "Bob wants to play poker",
         // "image": "https://vortex.accuweather.com/adc2010/images/icons-numbered/01-l.png"
      },
      "category" : "GAME_INVITATION"
   },
   "_nms_image": "https://vortex.accuweather.com/adc2010/images/icons-numbered/01-l.png"
}
 */

/**
 * Notification use case if sent by:
 * Receive (sent from FCM console):
 *    App in foreground: onNotification()
 *    App in background: handle by OS
 *    App was closed: handle by OS
 *    App service was killed: handle by OS
 *
 * Receive (sent from pushdy and custom data):
 *    App in foreground:
 *    App in background:
 *    App was closed:
 *    App service was killed:
 *
 *
 * Open:
 *    From foreground
 *    From background
 *    From closed: handleInitialNotification > onNotificationOpened > ...
 *    From killed
 *
 * To test fire directly your data to:
 *    FCM:
 *      curl ...
 *      Docs:
 *    APNs:
 *      curl ...
 *      Docs:
 */
class FirebaseMessaging {
  /**
   * Turn on console.log message for this service
   */
  // debug = Constant.BUILD_ENV === 'development';
  debug = false;
  log = new ColorLog({
    info: 'color: #000000; background: #e4ffe8;',
  });

  /**
   * If user is opening a push, then prevent app to be:
   *    - refresh,
   *    - restart,
   *    - auto-navigate to another route
   *    - ... <all action that can mislead to UX misunderstanding>
   *
   * @type {boolean}
   */
  pushOpening = false;

  /**
   * https://rnfirebase.io/docs/v5.x.x/notifications/receiving-notifications#3)-Listen-for-Notifications
   * componentDidMount() {
   *    FirebaseMessaging.ensurePermission().then(() => {
   *      FirebaseMessaging.register();
   *    });
   *    FirebaseMessaging.unregister();
   * }
   */
  register() {
    this.getFirebaseToken().then((fcmToken) => {
      this.debug && this.log.info('{FirebaseMessaging.register} fcmToken: ' + fcmToken);
      if (fcmToken) {
        if (Platform.OS === 'ios') {
          firebase.messaging().ios.registerForRemoteNotifications().then(() => {
            firebase.messaging().ios.getAPNSToken().then((apnsToken) => {
              this.onTokenUpdated(fcmToken, apnsToken);
            })
          })
        } else {
          this.onTokenUpdated(fcmToken);
        }
      }
    });

    this.messageListener = firebase.messaging()
      .onMessage((message: RemoteMessage) => {
        // Process your message as required
        this.onMessage(message);
      });

    this.removeNotificationDisplayedListener = firebase.notifications()
      .onNotificationDisplayed((notification: Notification) => {
        // Process your notification as required
        // ANDROID: Remote notifications do not contain the channel ID.
        // You will have to specify this manually if you'd like to re-display the notification.
        this.onNotificationDisplayed(notification);
      });

    this.removeNotificationListener = firebase.notifications()
      .onNotification((notification: Notification) => {
        // Process your notification as required
        this.onNotification(notification);
      });


    this.removeNotificationOpenedListener = firebase.notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) => {
        this.onNotificationOpened(notificationOpen);
      });

    this.onTokenRefreshListener = firebase.messaging()
      .onTokenRefresh(fcmToken => {
        // Process your token as required
        if (Platform.OS === 'ios') {
          firebase.messaging().ios.getAPNSToken().then((apnsToken) => {
            this.onTokenUpdated(fcmToken, apnsToken);
          })
        } else {
          this.onTokenUpdated(fcmToken);
        }
      });


    this.handleAndroid();
    this.handleInitialNotification();

    /**
     * Debug code section:
     * TODO: Turn off debug code
     */
    // this.scheduleNotification()
  }

  unregister() {
    this.removeNotificationDisplayedListener();
    this.removeNotificationListener();
    this.removeNotificationOpenedListener();
    this.messageListener();
    this.onTokenRefreshListener();
  }

  /**
   * Check and request permission if user has not granted
   * Or request user to turn on notification in OS Setting menu
   *
   * @returns {Promise<void>}
   */
  async ensurePermission(showAccquireOSSettingPopup = false) {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      // this.debug && this.log.info('{FirebaseMessaging.ensurePermission} user has permissions');
      return true;
    } else {
      /**
       * Case 1: First time app open => Show a native popup and user can choose Allow / Disallow
       * Case 2: Second open app => OS doesn't support tp show native popup again, so we need to warn user, and let they go to OS Setting to turn on notification
       */
      // user doesn't have permission
      try {
        await firebase.messaging().requestPermission();
        // User has authorised (Press Allow notification in native popup)
        // Or in android: User approve first time but turn off in OS setting
        if (Platform.OS === 'android' && showAccquireOSSettingPopup) {
          this.showRequestOsSettingPermissionPopup();
        }

        return true;
      } catch (error) {
        // User has rejected permissions (Press Cancel notification in native popup)
        // or user turn it off in OS Setting
        this.debug && this.log.info('{FirebaseMessaging.ensurePermission} user has rejected permissions');

        if (showAccquireOSSettingPopup) {
          this.showRequestOsSettingPermissionPopup();
        }

        return false;
      }
    }
  }

  accquireOSSettingIfNeeded() {
    this.ensurePermission(true);
  }

  async getFirebaseToken() {
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      // user has a device token
      return fcmToken;
    } else {
      // user doesn't have a device token yet
      return null;
    }
  }

  /**
   * Do not be confused between fcm token and apns token, FCM token is use for FCM and all SDK
   * We use pushdy to push so we need APNSToken, we don't use FCM to push
   *
   * @param fcmToken
   * @param apnsToken
   */
  onTokenUpdated(fcmToken, apnsToken = null) {
    this.debug && this.log.info('{FirebaseMessaging.onTokenUpdated} fcmToken, apnsToken: ', fcmToken, apnsToken);
    AppData.getInstance().setFcmToken(fcmToken);

    const deviceToken = Platform.OS === 'ios' ? apnsToken : fcmToken;
    if (deviceToken) {
      AppData.getInstance().setDeviceToken(deviceToken).then(() => {
        this.updateDeviceInfo();
      });
    } else {
      this.debug && this.log.info('{FirebaseMessaging.onTokenUpdated} Skip because deviceToken is null', deviceToken);
    }
  }

  async handleInitialNotification() {
    const notificationOpen: NotificationOpen = await firebase.notifications().getInitialNotification();
    this.debug && this.log.info('{FirebaseMessaging.handleInitialNotification} notificationOpen: ', notificationOpen);

    if (notificationOpen) {
      /**
       * Handle the bug if notification was re-handle if Codepush.restart()
       */
      const lastInitialId = await AppData.getInstance().getLastInitialNotificationId();
      const initialId = notificationOpen.notification.notificationId;
      if (lastInitialId && lastInitialId === initialId) {
        // Ignore if this notification have been handled
        this.debug && this.log.info('{FirebaseMessaging.handleInitialNotification} Notification was already handled in last session, skip:  notificationId: ', lastInitialId);
        return
      }

      AppData.getInstance().setLastInitialNotificationId(initialId);
      this.onNotificationOpened(notificationOpen, 'handleInitialNotification');
    }
  }

  /**
   * Firebase in app messaging
   * We class Messages as: data-only messages from FCM
   * A message will trigger the onMessage listener when the
   * application receives a message in the foreground.
   *
   * For background handler: use custom function onBackgroundMessage instead
   */
  onMessage(message: RemoteMessage) {
    // this.debug && this.log.info('{FirebaseMessaging.onMessage} message: ', message);
    this.handleDataMessage(message)
  }

  /**
   * Background message handler
   * Custom function was triggered by FirebaseBackgroundMessaging.js
   *
   * For foreground message handler => onMessage()
   */
  async onBackgroundMessage(message: RemoteMessage) {
    // console.log('{FirebaseMessaging.onBackgroundMessage} message: ', message);
    this.handleDataMessage(message)
  }

  handleDataMessage(message) {
    console.log('{FirebaseMessaging.handleDataMessage} message: ', message);

    let appState = LifeCycleManager.getInstance().getAppState();
    if (appState === 'active') {
      // foreground
      const notification = message;
      notification.title = message.data.title;
      notification.body = message.data.body;

      // NOTE: This is not a Notification data type, so might have bug if you wanna access new field
      // Please be careful
      this.showAppNotificationBanner(notification);
    } else {
      // other
      const notification = this.buildNotificationFromMessage(message);
      firebase.notifications().displayNotification(notification)
    }
  }

  /**
   * onNotificationDisplayed - Triggered when a particular notification has been displayed.
   * iOS Only: see IOSNotification#complete for details on handling completion of background downloads
   */
  onNotificationDisplayed(notification) {
    this.debug && this.log.info('{FirebaseMessaging.onNotificationDisplayed} notification: ', notification);
  }

  /**
   * onNotification -
   * Triggered when a particular notification has been received in foreground
   *
   * Android allows you to act on data-only messages when your application is closed or running in the background. This is particularly useful if you'd like to be able to show heads-up notifications to your user.
   * https://rnfirebase.io/docs/v5.x.x/messaging/receiving-messages#4)-(Optional)(Android-only)-Listen-for-FCM-messages-in-the-background
   */
  onNotification(notification: Notification) {
    // this.debug && this.log.info('{FirebaseMessaging.onNotification} notification: ', notification);
    this.showAppNotificationBanner(notification);
  }

  /**
   * User tap the notification on system tray
   */
  onNotificationOpened(notificationOpen: NotificationOpen, source = 'register') {
    this.debug && this.log.info('{FirebaseMessaging.onNotificationOpened} source, notificationOpen: ', source, notificationOpen);

    this.setPushOpening(true);

    const bannerData = this.getAppNotificationBannerData(notificationOpen.notification);

    /**
     * TODO: Should expose by delegation instead of emiting event
     * Delegation make this more standalone-able, none-fragile
     */
    EventBus.emit('OpenNotificationByData', bannerData, 'OsNotification');
    //  OpenNotificationByData event was handled at AppContainer

    // Remove in the notification center
    firebase.notifications().removeDeliveredNotification(notificationOpen.notification.notificationId);
  }


  showNotification(notification: NotificationOpen) {
    // this.debug && this.log.info('{FirebaseMessaging.showNotification} notification: ', notification);

    // Build notification
    const n = this.buildNotification(notification);

    // Display the notification
    firebase.notifications().displayNotification(n);
  }

  /**
   * Universal In app notification banner,
   * Because ios / android dont have a same behavior
   * So we need this universal banner
   */
  showAppNotificationBanner(notification: Notification) {
    this.debug && console.log('{FirebaseMessaging.showAppNotificationBanner} notification: ', notification);

    // Build notification
    // let n = this.buildNotification(notification); // If You need to get all data to fake os notification
    let n = notification; // Or if you just need title, body, image
    const bannerData = this.getAppNotificationBannerData(n);

    // if (Platform.OS === 'ios') {} else {}
    NotificationHelper.show(bannerData);
  }

  getAppNotificationBannerData(n: Notification) {
    return {
      title: n.title,
      message: n.body,
      media_url: n.data._nms_image,
      notificationData: n.data,
    };
  }

  scheduleNotification() {
    // Build notification
    // Schedule the notification for 1 minute in the future
    firebase.notifications().scheduleNotification(notification, {
      fireDate: (new Date()).getTime() + 6000, // notice after 6s
    })
  }

  /**
   *
   * @param {RemoteMessage} message
   * @returns {Notification}
   */
  buildNotificationFromMessage(message: RemoteMessage) {
    const data = message.data;
    // https://rnfirebase.io/docs/v5.x.x/notifications/reference/Notification
    const notification = new firebase.notifications.Notification()
      .setNotificationId(message.messageId)
      .setTitle(data.title)
      .setBody(data.body)
      .setData(data);

    if (data.sound) {
      notification.setSound(data.sound);
    }


    if (Platform.OS === 'android') {
      // https://rnfirebase.io/docs/v5.x.x/notifications/reference/AndroidNotification
      notification
        .android.setChannelId('news')
        .android.setSmallIcon('ic_notification') // fixed icon
        .android.setColor('#e71fff')
        .android.setBigText(data.body);
    }

    /*
    NOTE: To show only image as large icon, do not display it as bigPicture
    payload = {
      "priority": "high",
      "to": "{{fcm_token_aquos}}",
      "time_to_live": 259200,
      "data": {
        "title": "Bão số 6 hướng đi khó lường",
        "body": "Ít nhất 7 tỉnh thành sẽ bị ảnh hưởng, cần sẵn sàng tinh thần ứng phó",
        "image": "https://thumb.tinmoi24.vn/resize/192x192/anews:75:7:fa1f408369a151c27811306d2b178fc8/200/push?link=https://media.tinmoi24.vn/2019/11/8/11/648eafe5979333bf470f67098fbd8929.jpg"
      }
    }
     */
    if (data._nms_image) {
      // setBigPicture(picture, largeIcon, contentTitle, summaryText) returns Notification;
      notification.android.setSmallIcon('ic_notification');
      notification.android.setLargeIcon(data._nms_image);
      notification.android.setBigPicture('ic_launcher', data._nms_image, message.data.title, message.data.body)
    }
    if (data.ongoing) {
      notification.android.setOngoing(data.ongoing)
    }

    return notification;
  }

  /**
   * Convert fcm notification into our custom notification
   * @param {Notification} notification
   * @returns {Notification}
   */
  buildNotification(notification: Notification) {
    notification
      .android.setChannelId('news') // Fixed channel id for this app
      .android.setSmallIcon('ic_notification') // fixed icon
      .android.setColor('#e71fff');

    return notification;
  }

  updateDeviceInfo() {
    APIManager.updateDeviceInfo((response) => {
      this.debug && this.log.info("updateDeviceInfo: successed");
    }, (code, message) => {
      this.debug && this.log.info("updateDeviceInfo: failed " + message);
    });
  }

  handleAndroid() {
    if (Platform.OS === 'android') {
      // https://rnfirebase.io/docs/v5.x.x/notifications/reference/AndroidNotification
      // Build a channel
      const channel = new firebase.notifications.Android
        .Channel('news', 'News', firebase.notifications.Android.Importance.Max)
        .setDescription('News and stock feed');
      // Create the channel
      firebase.notifications().android.createChannel(channel);
    }
  }

  setPushOpening(v) {
    this.pushOpening = v;
  }

  /**
   * Trigger event to show popup in AppContainer
   */
  showRequestOsSettingPermissionPopup() {
    /**
     * TODO: Should expose by delegation instead of emiting event
     * Delegation make this more standalone-able, none-fragile
     */
    EventBus.emit('handleAppPopup', {
      visible: true,
      canDismiss: true,
      title: '',
      message: I18n.t("notifications.perm_dlg.msg"),
      lBtn: {
        text: I18n.t("notifications.perm_dlg.cancel"),
        onPress: () => {},
      },
      rBtn: {
        text: I18n.t("notifications.perm_dlg.ok"),
        onPress: () => {
          OpenAppSettings.open();
        },
      },
    });
  }
}

export default new FirebaseMessaging();