import { Platform } from 'react-native';

export const ANDROID_EMULATOR_API_URL = 'http://10.0.2.2:3000';
export const IOS_SIMULATOR_API_URL = 'http://127.0.0.1:3000';
export const DEVICE_LAN_API_URL = 'http://192.168.31.195:3000';
export const PRODUCTION_API_URL = 'https://event-tau-two.vercel.app';
export const USE_PRODUCTION_BACKEND_IN_DEV = true;

const DEV_API_BASE_URL =
  Platform.select({
    android: DEVICE_LAN_API_URL,
    ios: IOS_SIMULATOR_API_URL,
    default: DEVICE_LAN_API_URL,
  }) ?? DEVICE_LAN_API_URL;

export const API_BASE_URL =
  __DEV__ && !USE_PRODUCTION_BACKEND_IN_DEV ? DEV_API_BASE_URL : PRODUCTION_API_URL;

export const API_TIMEOUT_MS = 15000;
export const KEYCHAIN_SERVICE = 'eventease.mobile.auth';

// Replace these with the Google OAuth client IDs created for your Android/iOS app and web backend.
export const GOOGLE_WEB_CLIENT_ID = 'REPLACE_WITH_GOOGLE_WEB_CLIENT_ID';
export const GOOGLE_IOS_CLIENT_ID = 'REPLACE_WITH_GOOGLE_IOS_CLIENT_ID';
