import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import routeConfigMap from './Router'

const AppNavigator = createStackNavigator(routeConfigMap, {
  initialRouteName: 'Home',
});

export default createAppContainer(AppNavigator);