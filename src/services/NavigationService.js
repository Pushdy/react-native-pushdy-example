/**
 * Help you use navigator anywhere
 *
 * https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html
 */

import { NavigationActions, StackActions } from 'react-navigation';

let _navigator;

const MAX_RETRY_ALLOWED = 10;
const RETRY_INTERVAL = 300;

/**
 * App navigation service is initializing or haven't ready yet
 *
 * @returns {boolean}
 */
function isReady() {
  return !!_navigator;
}

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

/**
 * Try to navigate to route
 * If navigator was not ready then retry
 * Considering failed after 5 times unsuccessfully
 *
 * @param routeName
 * @param params
 * @param option
 * @param retry how many failed and retry
 */
function navigate(routeName, params, option = {}, retry = 0) {
  const opt = {
    routeName: routeName,
    params: params,
  };

  if (option.pushToStack) {
    opt.key = +(new Date); // force create new stack
  }

  if (isReady()) {
    try {
      _navigator.dispatch(NavigationActions.navigate(opt));
    } catch (e) {
      console.log('{NavigationService.navigate} e: ', e);
      if (option.onFailed) {
        option.onFailed(e);
      }
    }
  }
  else {
    if (retry < MAX_RETRY_ALLOWED) {
      // retry after 300ms
      console.warn('{NavigationService.navigate} navigate ' + routeName + ' retry ' + retry + ' times')
      setTimeout(() => {
        navigate(routeName, params, option, retry + 1)
      }, RETRY_INTERVAL);
    } else {
      console.warn('{NavigationService.navigate} navigate ' + routeName + ' failed after retry ' + retry + ' times')
    }
  }
}

function push(routeName, params, option = {}) {
  navigate(routeName, params, { ...option, pushToStack: true });
}

function setParams(params) {
  _navigator.dispatch(
    NavigationActions.setParams({
      param: params
    })
  );
}

// https://reactnavigation.org/docs/en/screen-tracking.html
function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

function onNavigationStateChange(prevState, currentState, action) {
  const currentScreen = getActiveRouteName(currentState);
  const prevScreen = getActiveRouteName(prevState);

  if (prevScreen !== currentScreen) {
    onRouteChange({
      prevScreen,
      currentScreen,
    });
  }
}

function onRouteChange(data) {
  // EventBus.emit('NavigationService_onRouteChange', data);
}

// add other navigation functions that you need and export them
const a = {
  navigate,
  push,
  setTopLevelNavigator,
  onNavigationStateChange,
  setParams,
  isReady,
};

window.tmp_Navigation = a;
export default a;
