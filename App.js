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

const App: () => React$Node = () => {
  return (
    <AppNavigator
      ref={navigatorRef => {
        NavigationService.setTopLevelNavigator(navigatorRef);
      }}
      onNavigationStateChange={NavigationService.onNavigationStateChange}
    />
  );
};


export default App;
