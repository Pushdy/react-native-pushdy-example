/**
 * Pushdy Messaging module
 *
 * This is the development example
 */
import Pushdy from 'react-native-pushdy'
import { Platform, Alert } from "react-native";
import OpenAppSettings from 'react-native-app-settings';

class PushdyMessaging {
  debug = false;

  register() {
    Pushdy.sampleMethod('Hello from JS with', 500, (msg, x2num) => {
      console.log('{PushdyMessaging.sampleMethod} msg, x2num: ', msg, x2num);
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
    return true;
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
}

export default new PushdyMessaging();
