import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native'
import messaging from '@react-native-firebase/messaging';

export const isIOS = Platform.OS === 'ios';

const config = isIOS
  ? {
    apiKey: "AIzaSyCkWnWkTFdlRw7o4bSnBtaFJavelgVGpEY",
    projectId: "react-native-pushdy-example",
    appId: "1:839440398189:ios:7ed17644bd2d7c907a8c64",
    storageBucket: "react-native-pushdy-example.appspot.com",
    databaseURL: "https://react-native-pushdy-example.firebaseio.com",
    messagingSenderId: "839440398189",
  }
  : null;
if (config === null) {
  throw Error("TODO: firebase.initializeApp config on android");
}

export async function initRNFirebaseService() {
  console.log('{firebase} firebase: ', firebase);
  if (firebase.apps.length === 0) {
    firebase.initializeApp(config);
  } else {
    console.log('{firebase has already initialized} : ');
  }

  await registerAppWithFCM();

  return true;
}

async function registerAppWithFCM() {
  await messaging().registerForRemoteNotifications();
}