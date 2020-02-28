/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import AppNavigator from './src/AppNavigator'
import NavigationService from './src/services/NavigationService'
import PushdyMessaging from './src/services/Pushdy/PushdyMessaging';

import * as FirebaseApp from "./src/services/Firebase/App";
import * as FirebaseAnalytics from "./src/services/Firebase/Analytics";


export default class App extends React.Component {
  componentDidMount() {
    PushdyMessaging.register();

    FirebaseApp.initRNFirebaseService().then(() => {
      // Test FirebaseAnalytics
      setTimeout(() => {
        FirebaseAnalytics.trackEvent('luatnd_test_firebase_analytics', { ok: true, ts: Date.now() })

        setInterval(() => {
          FirebaseAnalytics.trackEvent('luatnd_test_firebase_analytics', { ok: true, ts: Date.now() })
        }, 15000);
      }, 3000);
    });
  }

  componentWillUnmount() {
    PushdyMessaging.unregister();
  }

  render() {
    return (
      <AppNavigator
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
        onNavigationStateChange={NavigationService.onNavigationStateChange}
      />
    );
  }
}
