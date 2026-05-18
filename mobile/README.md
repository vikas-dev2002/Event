# EventEase Mobile

React Native CLI mobile client for EventEase. The existing Next.js project remains the web app, admin panel, and backend API.

## Stack

- React Native CLI
- TypeScript
- React Navigation
- Bottom Tabs + Native Stack
- Axios
- TanStack React Query
- NativeWind
- react-native-keychain
- react-native-vision-camera
- react-native-qrcode-svg
- react-native-svg
- lucide-react-native
- zod

## Project Layout

The mobile app lives in `EventEase-main/mobile`.

The backend and web/admin app stay in the existing Next.js app at the repo root.

## Install

From `EventEase-main/mobile`:

```bash
npm install
```

For iOS:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Run The Backend First

From `EventEase-main`:

```bash
npm install
npm run dev
```

This starts the Next.js backend at `http://localhost:3000`.

## Base URL Setup

The API base URL is configured in:

`mobile/src/constants/config.ts`

Default values:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000`
- Physical phone: `http://192.168.1.100:3000`
- Production: `https://your-nextjs-domain.com`

### Android Emulator

Android emulators cannot use `localhost` to reach the host machine. Use:

`http://10.0.2.2:3000`

### Physical Phone

Replace `DEVICE_LAN_API_URL` in `mobile/src/constants/config.ts` with your machine's local network IP, for example:

`http://192.168.1.25:3000`

Make sure:

- phone and development machine are on the same Wi-Fi
- firewall allows port `3000`
- Next.js is running

### Production

Replace `PRODUCTION_API_URL` with the deployed Next.js domain.

## Run Android

```bash
npm run android
```

## Run iOS

```bash
npm run ios
```

## Useful Scripts

```bash
npm run start
npm run start:reset-cache
npm run android
npm run android:clean
npm run ios
npm run lint
npm run typecheck
```

## Notes

- Mobile auth uses `/api/mobile/auth/*` routes and secure token storage.
- Existing NextAuth browser flows remain unchanged for web.
- Existing shared APIs such as `/api/events`, `/api/attendance`, `/api/certificates`, `/api/notifications`, and `/api/announcements` are used by mobile with bearer-token auth support.
- Organizer QR attendance currently includes the Vision Camera preview plus manual QR value entry flow. If you want automatic on-device QR decoding next, we can add the matching Vision Camera QR plugin layer on top of this setup.
