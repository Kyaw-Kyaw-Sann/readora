# Readora Mobile

React Native / Expo mobile client for the Readora digital reading and audiobook platform.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_BASE_URL` to the Spring Boot API base URL.
3. Install dependencies and start Expo.

```bash
npm install
npm start
```

## Foundation

- Expo Router routes in `app/`
- Feature and shared source in `src/`
- NativeWind design tokens in `tailwind.config.js`
- Axios client with serialized token refresh
- SecureStore token persistence
- TanStack Query provider
