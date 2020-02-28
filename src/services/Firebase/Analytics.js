import analytics from '@react-native-firebase/analytics';

export async function trackEvent(eventName, data) {
  return analytics().logEvent(eventName, data);
}
