# Readora Mobile

Readora is an Expo and React Native mobile client for a personalized digital reading and audiobook platform. It connects to the Readora Spring Boot API and lets users discover books, read PDFs, listen to audiobooks, save progress, manage a personal library, review books, and use a mock Premium subscription.

## Current features

- Email/password authentication, verification, and password recovery
- Google account support through the backend authentication flow
- Reading-interest onboarding and profile management
- Home recommendations, popular/new/free books, and resume progress
- Search by title or author with category/access filters, sorting, and pagination
- Book details, favorites, reviews, and ratings
- Personal library with reading and listening history
- Expo Go-compatible PDF reader with saved reading progress
- Expo Audio player with saved listening progress
- Mock monthly/yearly Premium subscription management
- Light and dark themes

The backend is the authority for authentication, email verification, Premium access, book visibility, reviews, favorites, and progress data.

## Technology

- Expo SDK 57 and React Native
- TypeScript and Expo Router
- NativeWind
- TanStack Query for server state
- Zustand for session and theme state
- Axios with serialized token refresh
- React Hook Form and Zod
- Expo SecureStore for authentication tokens
- Expo Image, Expo Audio, and WebView/PDF.js

## Requirements

- Node.js LTS and npm
- The Expo Go app compatible with Expo SDK 57
- A running Readora Spring Boot backend
- A phone and development computer on the same network when testing on a physical device

Android Studio or Xcode is optional. This project can run in Expo Go and does not require a development build for its current feature set.

## Setup

1. Open a terminal in the project directory:

   ```powershell
   cd D:\User\readora
   ```

2. Install the exact dependency versions from the lock file:

   ```bash
   npm ci
   ```

   Use `npm install` instead when intentionally updating dependencies.

3. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Set the backend URL in `.env`:

   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080
   ```

   Replace `192.168.1.100` with the LAN IPv4 address of the computer running the backend. Do not include a trailing `/api`, because API modules already include it in endpoint paths.

## Backend connectivity

For a physical phone, `localhost` points to the phone—not the development computer. Use the backend computer's LAN IP and make sure:

- the phone and computer are connected to the same Wi-Fi/network;
- the Spring Boot API is running on the configured port;
- the backend accepts connections from the LAN instead of binding only to localhost;
- the operating-system firewall allows inbound connections to the backend port;
- opening `http://<COMPUTER_IP>:8080` from the phone can reach the server.

From Windows, test the backend port with:

```powershell
Test-NetConnection 192.168.1.100 -Port 8080
```

For an Android emulator, the host computer is usually available at `http://10.0.2.2:8080`. The web build may require the backend CORS configuration to allow the Expo web origin.

After changing `.env`, stop Metro and restart it with cache clearing:

```bash
npx expo start --clear
```

## Run

Start the Expo development server:

```bash
npm start
```

Then scan the terminal QR code with Expo Go. Other available commands are:

```bash
npm run android
npm run ios
npm run web
```

`npm run ios` requires macOS and an iOS simulator unless the app is opened on a physical device through Expo Go.

## Quality checks

Run TypeScript and lint before committing changes:

```bash
npx tsc --noEmit
npm run lint
```

Focused non-device checks are available in `scripts/`:

```bash
node scripts/test-account.mjs
node scripts/test-reading-progress.mjs
node scripts/test-listening-progress.mjs
node scripts/test-pdf-viewer.mjs
node scripts/test-audio-player.mjs
node scripts/test-reviews.mjs
node scripts/test-subscriptions.mjs
```

These scripts verify focused application logic; they do not replace testing the complete flow against a running backend on a real phone.

## Project structure

```text
app/                  Expo Router screens and route groups
  (auth)/             Sign-in, registration, verification, and recovery
  (onboarding)/       Initial interest selection
  (tabs)/             Home, Search, Library, and Profile tabs
  book/               Book details and reviews
  reader/             PDF reader route
  player/             Audio player route
  premium/            Mock Premium subscription flow
assets/               Images, logo assets, and generated PDF.js resources
scripts/              Focused logic checks and PDF.js build tooling
src/
  api/                Axios client, endpoint modules, and query keys
  components/         Reusable UI and feature components
  constants/          Environment and design tokens
  hooks/              TanStack Query and feature hooks
  lib/                Session, token, and progress utilities
  providers/          App-level providers
  schemas/            Zod form schemas
  stores/             Authentication and theme state
  types/              Shared API/domain types
```

## Security notes

- `.env` is local and ignored by Git; only `.env.example` should be committed.
- Access and refresh tokens are stored with Expo SecureStore.
- Never commit passwords, tokens, OTPs, API secrets, or Cloudinary credentials.
- The app must not send the Readora JWT to Cloudinary resource URLs.
- Premium is subscription state, not a user role; backend authorization remains authoritative.

## Troubleshooting

### `Network Error`

Confirm the value in `.env`, verify the backend port with `Test-NetConnection`, and test the API from the phone browser. A working Expo/Metro URL does not prove that the separate Spring Boot port is reachable.

### Expo Go reports an incompatible SDK

The Expo Go version and project SDK must be compatible. This project currently uses Expo SDK 57. Update Expo Go or use a compatible Expo Go installation; do not arbitrarily upgrade project dependencies one at a time.

### Changes do not appear

Restart Metro with `npx expo start --clear`, then reopen the project in Expo Go.

### Images do not appear

Verify that the API returns a plain URL such as `https://res.cloudinary.com/...`, not Markdown link syntax like `[url](url)`. Also confirm the URL opens directly on the phone.

## Current scope limitations

The current portfolio/demo scope intentionally excludes real payments, offline downloads, advanced background audio, lock-screen media controls, push notifications, DRM, and an AI/ML replacement for backend recommendations.
