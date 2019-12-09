/**
 * Pushdy Messaging module
 *
 * This is the development example
 */
import Pushdy from 'react-native-pushdy'
import { Platform, Alert } from "react-native";
import OpenAppSettings from 'react-native-app-settings';

import ColorLog from '../ColorLog'

class PushdyMessaging {
  debug = true;
  log = new ColorLog({}, {prefix: '[PushdyMessaging] '});

  async register() {
    // const [msg, x2num] = await Pushdy.sampleMethod('Hello from JS with', 500);
    // console.log('{register} msg, x2num: ', msg, x2num);

    Pushdy.getDeviceToken().then((deviceToken) => {
      console.log('{PushdyMessaging} deviceToken: ', deviceToken);
      if (deviceToken) {
        this.onTokenUpdated(deviceToken);
      } else {
        this.log.info('deviceToken is empty: ', deviceToken);
      }
    });
  }

  unregister() {}


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

  onTokenUpdated(deviceToken) {
    this.debug && this.log.info('{FirebaseMessaging.onTokenUpdated} deviceToken: ', deviceToken);

    if (deviceToken) {
      // Do sth like Save token to localStorage
    } else {
      this.debug && this.log.info('{FirebaseMessaging.onTokenUpdated} Skip because deviceToken is null', deviceToken);
    }
  }
}

export default new PushdyMessaging();
