import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/constants/config';

let configured = false;

export function configureGoogleAuth() {
  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID !== 'REPLACE_WITH_GOOGLE_WEB_CLIENT_ID' ? GOOGLE_WEB_CLIENT_ID : undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID !== 'REPLACE_WITH_GOOGLE_IOS_CLIENT_ID' ? GOOGLE_IOS_CLIENT_ID : undefined,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });

  configured = true;
}
